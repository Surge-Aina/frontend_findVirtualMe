export default function PasswordRule({ valid, label }) {
  return (
    <div className={`flex items-center gap-2 ${valid ? "text-green-600" : "text-gray-500"}`}>
      <span>{valid ? "✔" : "•"}</span>
      <span>{label}</span>
    </div>
  );
}
