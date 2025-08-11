export default function PortfolioCard({ portfolio, onAdd }) {
  if (onAdd) {
    return (
      <div
        className="card cursor-pointer text-center flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
        onClick={onAdd}
      >
        <span className="text-5xl text-blue-600">+</span>
        <p className="mt-2">Add Portfolio</p>
      </div>
    );
  }
  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-2">{portfolio.name}</h3>
      <p className="mb-4">{portfolio.description}</p>
      <button className="btn">Open Portfolio</button>
    </div>
  );
}