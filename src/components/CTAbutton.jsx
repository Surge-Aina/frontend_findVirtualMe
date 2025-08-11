export default function CTAbutton({ onClick }) {
  return (
    <button
      className="btn bg-blue-600 hover:bg-blue-700 transition-colors"
      onClick={onClick}
    >
      Get started with your portfolio
    </button>
  );
}