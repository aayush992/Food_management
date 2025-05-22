import React from 'react';
import './Gallery.css';

const Gallery = () => {
  const galleryImages = [
    { src: '/images/gallery1.jpg', alt: 'Gallery Image 1' },
    { src: '/images/gallery2.jpg', alt: 'Gallery Image 2' },
    { src: '/images/gallery3.webp', alt: 'Gallery Image 3' },
    { src: '/images/gallery4.jpg', alt: 'Gallery Image 4' },
    { src: '/images/gallery5.jpg', alt: 'Gallery Image 5' },
    { src: '/images/gallery6.jpg', alt: 'Gallery Image 6' },
    { src: '/images/gallery8.webp', alt: 'Gallery Image 8' },
    { src: '/images/food1.png', alt: 'Food Image 1' },
    { src: '/images/food2.webp.jpg', alt: 'Food Image 2' },
    { src: '/images/food3.jpg', alt: 'Food Image 3' },
  ];

  return (
    <section className="gallery-section">
      <h2>Our Food Gallery</h2>
      <div className="gallery-grid">
        {galleryImages.map((image, index) => (
          <div key={index} className="gallery-item">
            <img src={image.src} alt={image.alt} loading="lazy" />
            <div className="gallery-overlay">
              <div className="gallery-overlay-content">
                <h3>Delicious Food</h3>
                <p>Click to view details</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery; 