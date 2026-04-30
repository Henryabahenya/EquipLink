import React from 'react';

const MaterialsList = ({ materials }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((material) => (
        <div
          key={material.id}
          className="bg-[#1E1E1E] p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 hover:bg-[#2A2A2A] border border-gray-700"
        >
          <h3 className="text-xl font-bold mb-2 text-[#00D1FF]">{material.name}</h3>
          <p className="text-gray-300 mb-4">{material.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">{material.category}</span>
            <span className="text-lg font-semibold text-[#00D1FF]">${material.price}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaterialsList;