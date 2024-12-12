import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axiosD from '../../axiosDefault';
import styled from 'styled-components';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";


const FullScreenContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const FullScreenCarouselWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  max-height: 600px;
    @media (max-width: 480px) {
    max-height: 300px;
  }
`;

export function FullScreenCarousel() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axiosD.get('/images');
        setImages(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching images:', error);
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 8000,
    arrows: false,
    adaptiveHeight: true,  // Se ajusta la altura del slider según la altura de las imágenes
    pauseOnHover: true,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <FullScreenContainer>
      <FullScreenCarouselWrapper>
        <Slider {...settings}>
          {images.map((image, index) => (
            <ImageContainer key={index}>
              <Image src={image} alt={`carousel image ${index}`} />
            </ImageContainer>
          ))}
        </Slider>
      </FullScreenCarouselWrapper>
    </FullScreenContainer>
  );
}