"use client";

import { useState } from "react";

export default function IngredientList({ analysisData }) {
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  if (!analysisData || !analysisData.success) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No ingredient data available</p>
      </div>
    );
  }

  const { ingredients, blurbs, schemas } = analysisData;

  // Calculate overall rating
  const calculateOverallRating = () => {
    if (!schemas || Object.keys(schemas).length === 0) return null;
    
    const ratings = Object.values(schemas)
      .map(schema => schema.health_safety_rating)
      .filter(rating => rating !== undefined && rating !== null);
    
    if (ratings.length === 0) return null;
    
    const avg = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return avg;
  };

  const overallRating = calculateOverallRating();

  const getRatingColor = (rating) => {
    if (rating >= 0.75) return "text-green-600 bg-green-100";
    if (rating >= 0.5) return "text-yellow-600 bg-yellow-100";
    if (rating >= 0.25) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getRatingLabel = (rating) => {
    if (rating >= 0.75) return "Good";
    if (rating >= 0.5) return "Okay";
    if (rating >= 0.25) return "Caution";
    return "Avoid";
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating Card */}
      {overallRating !== null && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Overall Health Score
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-5xl font-bold text-indigo-600">
              {(overallRating * 100).toFixed(0)}
            </div>
            <div>
              <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getRatingColor(overallRating)}`}>
                {getRatingLabel(overallRating)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Based on {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Raw Text Display */}
      {analysisData.raw_text && (
        <details className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300">
            📄 View Raw OCR Text
          </summary>
          <pre className="mt-3 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {analysisData.raw_text}
          </pre>
        </details>
      )}

      {/* Ingredients List */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Detected Ingredients ({ingredients.length})
        </h3>
        
        {ingredients.map((ingredient, index) => {
          const schema = schemas[ingredient] || {};
          const rating = schema.health_safety_rating;
          
          return (
            <div
              key={index}
              onClick={() => setSelectedIngredient(selectedIngredient === ingredient ? null : ingredient)}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                    {ingredient}
                  </h4>
                  {blurbs[ingredient] && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {blurbs[ingredient]}
                    </p>
                  )}
                </div>
                
                {rating !== undefined && (
                  <div className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${getRatingColor(rating)}`}>
                    {getRatingLabel(rating)}
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {selectedIngredient === ingredient && schema && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3 animate-fade-in">
                  {schema.chemical_properties && (
                    <div>
                      <h5 className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                        Chemical Properties
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {schema.chemical_properties}
                      </p>
                    </div>
                  )}

                  {schema.common_uses && (
                    <div>
                      <h5 className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                        Common Uses
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {schema.common_uses}
                      </p>
                    </div>
                  )}

                  {schema.safety_and_controversy && (
                    <div>
                      <h5 className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                        Safety & Controversy
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {schema.safety_and_controversy}
                      </p>
                    </div>
                  )}

                  {schema.environmental_and_regulation && (
                    <div>
                      <h5 className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                        Environmental Impact
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {schema.environmental_and_regulation}
                      </p>
                    </div>
                  )}

                  {schema.edible !== undefined && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Edible:
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        schema.edible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {schema.edible ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}