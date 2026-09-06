import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// Importing images
import img1 from '../assets/Images/Picnic.jpeg';
import img2 from '../assets/Images/familygathering.jpg';
import img3 from '../assets/Images/KittyParty.jpeg';
import img4 from '../assets/Images/EventOrganisin.jpeg';
import img5 from '../assets/Images/weddingdestination.jpg';
import img6 from '../assets/Images/preweddingshoot.jpg';
import img7 from '../assets/Images/birthdayPlanning.webp';
import img8 from '../assets/Images/corporateevent.webp';
import img9 from '../assets/Images/schoolpicnic.png';
import img10 from '../assets/Images/CorporateShoot.jpeg';
import img11 from '../assets/Images/musicalbum.jpeg';
import img12 from '../assets/Images/movieshooting.avif';

const eventImages = {
  'One Day Picnic': img1,
  'Family Gatherings': img2,
  'Kitty Parties': img3,
  'Event Organizing': img4,
  'Wedding Destination': img5,
  'Pre-wedding Photoshoots': img6,
  'Birthday Party Planning': img7,
  'Corporate Event Planning': img8,
  'School Picnic Arrangements': img9,
  'Corporate Photoshoots': img10,
  'Music Album Shoot Locations': img11,
  'Movie Shooting Locations': img12
};

const events = [
  { 
    title: 'One Day Picnic', 
    image: eventImages['One Day Picnic'], 
    capacity: '5-100 People'
  },
  { 
    title: 'Family Gatherings', 
    image: eventImages['Family Gatherings'], 
    capacity: '10-80 People'
  },
  { 
    title: 'Kitty Parties', 
    image: eventImages['Kitty Parties'], 
    capacity: '20-40 People'
  },
  { 
    title: 'Event Organizing', 
    image: eventImages['Event Organizing'], 
    capacity: '100-500 People'
  },
  { 
    title: 'Wedding Destination', 
    image: eventImages['Wedding Destination'], 
    capacity: '100-300 People'
  },
  { 
    title: 'Pre-wedding Photoshoots', 
    image: eventImages['Pre-wedding Photoshoots'], 
    capacity: '10-20 People'
  },
  { 
    title: 'Birthday Party Planning', 
    image: eventImages['Birthday Party Planning'], 
    capacity: '20-60 People'
  },
  { 
    title: 'Corporate Event Planning', 
    image: eventImages['Corporate Event Planning'], 
    capacity: '50-200 People'
  },
  { 
    title: 'School Picnic Arrangements', 
    image: eventImages['School Picnic Arrangements'], 
    capacity: '100-500 People'
  },
  { 
    title: 'Corporate Photoshoots', 
    image: eventImages['Corporate Photoshoots'], 
    capacity: '10-30 People'
  },
  { 
    title: 'Music Album Shoot Locations', 
    image: eventImages['Music Album Shoot Locations'], 
    capacity: '15-75 People'
  },
  { 
    title: 'Movie Shooting Locations', 
    image: eventImages['Movie Shooting Locations'], 
    capacity: '20-50 People'
  },
];

// Styled Components
const SectionWrapper = styled.section`
  padding: 3rem 2rem 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
`;

const Heading = styled.h2`
  font-family: 'Crimson Text', serif;
  font-size: 4rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subheading = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  color: #718096;
  margin-bottom: 0;
  font-weight: 400;
`;

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  padding: 1rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const AutoScrollTrack = styled(motion.div)`
  display: flex;
  gap: 1.5rem;
  width: max-content;
  animation: ${props => props.isAutoPlay ? 'scroll 120s linear infinite' : 'none'};
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    animation-play-state: paused;
  }
  
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(-300px * 12 - 1.5rem * 12));
    }
  }
`;

const NavigationControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const NavigationButton = styled(motion.button)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%);
    box-shadow: 0 6px 20px rgba(66, 153, 225, 0.4);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CardWrapper = styled.div`
  flex-shrink: 0;
  width: 18.75rem;
  height: 24rem;
  position: relative;
  cursor: pointer;
`;

const Card = styled(motion.div)`
  width: 100%;
  height: 100%;
  border-radius: 1.25rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: white;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    transform: translateY(-5px);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 65%;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 1rem;
  height: 35%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  line-height: 1.3;
`;

const CardDetails = styled.div`
  display: flex;
  gap: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #718096;
  font-size: 0.85rem;
`;

const Events = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isManualNav, setIsManualNav] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    const locationsElement = document.getElementById('locations');
    if (locationsElement) {
      locationsElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('locations')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const nextSlide = () => {
    setIsManualNav(true);
    setIsAutoPlay(false);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      return newIndex >= events.length ? 0 : newIndex;
    });
    
    setTimeout(() => {
      setIsManualNav(false);
      setIsAutoPlay(true);
    }, 5000);
  };

  const prevSlide = () => {
    setIsManualNav(true);
    setIsAutoPlay(false);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - 1;
      return newIndex < 0 ? events.length - 1 : newIndex;
    });
    
    setTimeout(() => {
      setIsManualNav(false);
      setIsAutoPlay(true);
    }, 5000);
  };

  const duplicatedEvents = [...events, ...events, ...events];
  const cardWidth = 300 + 24;
  const translateX = isManualNav ? -(currentIndex * cardWidth) : 0;

  return (
    <SectionWrapper>
      <HeaderContainer>
        <Heading>Stress-free Celebration Starts Here!</Heading>
        <Subheading>Discover Perfect Venues for Your Special Events</Subheading>
      </HeaderContainer>

      <CarouselContainer>
        <AutoScrollTrack
          isAutoPlay={isAutoPlay}
          style={{
            transform: isManualNav ? `translateX(${translateX}px)` : undefined,
          }}
        >
          {duplicatedEvents.map((event, index) => (
            <CardWrapper key={index} onClick={handleCardClick}>
              <Card whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <CardImage src={event.image} alt={event.title} />
                <CardContent>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                  </CardHeader>
                  <CardDetails>
                    <DetailItem>
                      <Users size={16} />
                      {event.capacity}
                    </DetailItem>
                  </CardDetails>
                </CardContent>
              </Card>
            </CardWrapper>
          ))}
        </AutoScrollTrack>

        <NavigationControls>
          <NavigationButton
            onClick={prevSlide}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={20} />
          </NavigationButton>
          <NavigationButton
            onClick={nextSlide}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={20} />
          </NavigationButton>
        </NavigationControls>
      </CarouselContainer>
    </SectionWrapper>
  );
};

export default Events;