export default function IngredientList({ ingredients }) {
  if (!ingredients || ingredients.length === 0) {
    return <p>No ingredients to show. Upload an image first!</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Ingredients Summary</h2>
      <ul className="list-disc ml-6">
        {ingredients.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
