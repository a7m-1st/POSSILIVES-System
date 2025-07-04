import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

import React from "react";
import { CarouselProps } from "../../types/types";

const MyCarousel = ({ items }: { items: CarouselProps[] }) => {
  function convertIsoToReadable(isoDateString) {
    const date = new Date(isoDateString);
    
    // Customize options for date formatting
    const options = {
      year: 'numeric',
      month: 'long', // 'short' for abbreviated month name
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true // Use 12-hour format (set to false for 24-hour format)
    };
  
    // Convert to readable format
    const readableDate = date.toLocaleString('en-US', options); // Change 'en-US' to your preferred locale
  
    return readableDate;
  }

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 3, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  return (
    <>
      <Carousel
        swipeable={true}
        draggable={true}
        showDots={true}
        responsive={responsive}
        ssr={true}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
        customTransition="transform 1000ms ease-in-out"
        transitionDuration={1000}
        containerClass="carousel-container"
        removeArrowOnDeviceType={["tablet"]}
        deviceType={"mobile"}
        dotListClass="custom-dot-list-style"
        itemClass="carousel-item-padding-40-px mx-2 rounded-md"
      >
        {items.map((item) => {
          return (
            <div className="relative">
              <img
                src="https://picsum.photos/800/400"
                alt={item.createdAt}
                className="w-full h-full object-cover rounded-lg"
              />
              <small className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                {convertIsoToReadable(item.createdAt)}
              </small>
            </div>
          );
        })}
      </Carousel>
      ;
    </>
  );
};

export default MyCarousel;
