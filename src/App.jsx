import { useState, useEffect } from 'react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]); // Estado para guardar os itens do carrinho

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => console.error('Erro ao buscar produtos:', error));
  }, []);

  // Função para adicionar item ao carrinho
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // Se já existe, aumenta a quantidade
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Se não existe, adiciona com quantidade 1
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Função para remover ou diminuir item do carrinho
  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Cálculo do valor total do pedido
  const totalOrderPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Função para enviar o pedido para o back-end Java
  const checkout = () => {
    if (cart.length === 0) return;

    // Monta o objeto no formato que o Spring Boot espera
    const orderData = {
      total: totalOrderPrice,
      items: cart.map(item => ({
        productName: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    };

    // Envia via POST para a API Java
    fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Erro ao finalizar o pedido.');
      })
      .then((data) => {
        alert(`Pedido #${data.id} realizado com sucesso! 🔥 Bom apetite!`);
        setCart([]); // Limpa o carrinho após o sucesso
      })
      .catch((error) => {
        console.error('Erro:', error);
        alert('Não foi possível finalizar o pedido. Verifique o back-end.');
      });
  };

  if (loading) {
    return <div className="p-8 text-center text-xl text-orange-600 font-medium">Carregando o cardápio da galeteria... 🔥</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Coluna da Esquerda: Cardápio (Ocupa 2 colunas) */}
        <div className="md:col-span-2">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold text-orange-600">Galeteria Sabor & Brasa 🍗</h1>
            <p className="text-gray-500">Escolha os melhores galetos e acompanhamentos fresquinhos.</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 p-4 rounded-xl shadow-sm bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <span className="text-xs font-semibold bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    {product.category}
                  </span>
                  <h2 className="text-lg font-bold text-gray-800 mt-2">{product.name}</h2>
                  <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                </div>
                
                <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-lg font-bold text-green-600">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Adicionar +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna da Direita: Carrinho / Resumo do Pedido */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm h-fit sticky top-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">Seu Pedido 🛒</h2>

          {cart.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">Seu carrinho está vazio. Adicione itens do cardápio!</p>
          ) : (
            <div className="space-y-4">
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-gray-500 text-xs">R$ {item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 w-6 h-6 rounded flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => addToCard(item)}
                        className="bg-orange-100 hover:bg-orange-200 text-orange-700 w-6 h-6 rounded flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 mb-4">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {totalOrderPrice.toFixed(2)}</span>
                </div>

                <button
                  onClick={checkout}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
                >
                  Finalizar Pedido
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}