import React from "react";
import { CarouselProps } from "../../types/types";
import { Link } from "react-router-dom";

const FutureCard = ({
  item,
  index,
}: {
  item: CarouselProps;
  index: number;
}) => {
  // Determine image source: use provided image URL or fallback to images array or default
  const getImageSource = () => {
    if (item.image) {
      return item.image; // Direct image URL (for newly generated images)
    }
    if (item.images && item.images.length > 0) {
      return item.images[0].link; // From images array (existing database images)
    }
    return "https://picsum.photos/800/400"; // Fallback
  };

  return (
    <Link to={`/future/1`} className="block p-2" onClick={() => sessionStorage.setItem("selectedItem", JSON.stringify(item))}>
      <div 
        className="relative transform transition-transform duration-200 hover:scale-95 active:scale-90"
      >
        <img
        src={getImageSource()}
        alt={item.createdAt}
        className="w-full h-full object-cover rounded-lg"
        />
        <small className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        {item.createdAt}
        </small>
      </div>
    </Link>
  );
};

export default FutureCard;
