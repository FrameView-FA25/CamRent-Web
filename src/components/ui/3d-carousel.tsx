import React, { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

interface CarouselItem {
  title: string;
  img: string;
}

interface ThreeDCarouselProps {
  items: CarouselItem[];
}

const ThreeDCarousel: React.FC<ThreeDCarouselProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const getPosition = (index: number) => {
    const diff = index - currentIndex;
    if (diff === 0) return "center";
    if (diff === 1 || diff === -(items.length - 1)) return "right";
    if (diff === -1 || diff === items.length - 1) return "left";
    return "hidden";
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: "400px", md: "500px" },
        background: "transparent",
        borderRadius: 4,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Navigation Buttons */}
      <IconButton
        onClick={handlePrev}
        sx={{
          position: "absolute",
          left: { xs: 8, md: 24 },
          zIndex: 10,
          bgcolor: "rgba(0,0,0,0.05)",
          backdropFilter: "blur(10px)",
          color: "#111827",
          "&:hover": {
            bgcolor: "rgba(0,0,0,0.1)",
          },
        }}
      >
        <ChevronLeft />
      </IconButton>

      <IconButton
        onClick={handleNext}
        sx={{
          position: "absolute",
          right: { xs: 8, md: 24 },
          zIndex: 10,
          bgcolor: "rgba(0,0,0,0.05)",
          backdropFilter: "blur(10px)",
          color: "#111827",
          "&:hover": {
            bgcolor: "rgba(0,0,0,0.1)",
          },
        }}
      >
        <ChevronRight />
      </IconButton>

      {/* Carousel Items */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          perspective: "1000px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {items.map((item, index) => {
          const position = getPosition(index);

          return (
            <Box
              key={index}
              sx={{
                position: "absolute",
                width: { xs: "200px", md: "280px" },
                height: { xs: "320px", md: "400px" },
                borderRadius: 4,
                overflow: "hidden",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                boxShadow:
                  position === "center"
                    ? "0 25px 50px -12px rgba(0,0,0,0.25)"
                    : "0 10px 30px -10px rgba(0,0,0,0.15)",
                ...(position === "center" && {
                  transform: "translateX(0) scale(1.15) rotateY(0deg)",
                  zIndex: 3,
                  opacity: 1,
                }),
                ...(position === "left" && {
                  transform: {
                    xs: "translateX(-100px) scale(0.85) rotateY(25deg)",
                    md: "translateX(-280px) scale(0.85) rotateY(25deg)",
                  },
                  zIndex: 2,
                  opacity: 0.7,
                }),
                ...(position === "right" && {
                  transform: {
                    xs: "translateX(100px) scale(0.85) rotateY(-25deg)",
                    md: "translateX(280px) scale(0.85) rotateY(-25deg)",
                  },
                  zIndex: 2,
                  opacity: 0.7,
                }),
                ...(position === "hidden" && {
                  transform: "scale(0.5)",
                  opacity: 0,
                  zIndex: 1,
                }),
                "&:hover": {
                  ...(position === "center" && {
                    transform: "translateX(0) scale(1.2) rotateY(0deg)",
                  }),
                },
              }}
              onClick={() => {
                if (position === "left") handlePrev();
                if (position === "right") handleNext();
              }}
            >
              {/* Image */}
              <Box
                component="img"
                src={item.img}
                alt={item.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Overlay */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
                }}
              />

              {/* Title */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 3,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: { xs: "1.1rem", md: "1.3rem" },
                    textAlign: "center",
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {item.title}
                </Typography>
              </Box>

              {/* Reflection Effect */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
                  pointerEvents: "none",
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* Dots Indicator */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
          zIndex: 10,
        }}
      >
        {items.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: index === currentIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: index === currentIndex ? "#F97316" : "rgba(0,0,0,0.2)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              "&:hover": {
                bgcolor: "#F97316",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ThreeDCarousel;
