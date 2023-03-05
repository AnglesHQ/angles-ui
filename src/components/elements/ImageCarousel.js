import React, { useEffect } from 'react';
import Carousel from 'react-multi-carousel';

const ImageCarousel = function (props) {
  const {
    screenshots,
    loadScreenshot,
    deviceType,
    selectedScreenshotDetails,
  } = props;
  // eslint-disable-next-line react/no-this-in-sfc
  const setReference = (el) => { this.Carousel = el; };
  const responsive = {
    desktopxxl: {
      breakpoint: { max: 5000, min: 2500 },
      items: 6,
      slidesToSlide: 2, // optional, default to 1.
    },
    desktopxl: {
      breakpoint: { max: 2500, min: 1600 },
      items: 5,
      slidesToSlide: 2, // optional, default to 1.
    },
    desktop: {
      breakpoint: { max: 1600, min: 1400 },
      items: 4,
      slidesToSlide: 2, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1400, min: 1000 },
      items: 3,
      slidesToSlide: 1, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 1000, min: 700 },
      items: 2,
      slidesToSlide: 1, // optional, default to 1.
    },
    mobilesm: {
      breakpoint: { max: 700, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  const getNextImage = (currentScreenshotId) => {
    const index = screenshots.findIndex((screenshot) => screenshot._id === currentScreenshotId);
    const nextIndex = index + 1;
    if (nextIndex < screenshots.length) {
      loadScreenshot(screenshots[nextIndex]._id);
      // eslint-disable-next-line react/no-this-in-sfc
      this.Carousel.goToSlide(nextIndex, false);
    }
  };

  const getPreviousImage = (currentScreenshotId) => {
    const index = screenshots.findIndex((screenshot) => screenshot._id === currentScreenshotId);
    const nextIndex = index - 1;
    if (nextIndex >= 0) {
      loadScreenshot(screenshots[nextIndex]._id);
      // eslint-disable-next-line react/no-this-in-sfc
      this.Carousel.goToSlide(nextIndex, false);
    }
  };

  const handleArrowKeys = (event) => {
    if (event.keyCode === 37 && selectedScreenshotDetails) {
      // left - previous
      getPreviousImage(selectedScreenshotDetails._id);
    }
    if (event.keyCode === 39 && selectedScreenshotDetails) {
      // right - next
      getNextImage(selectedScreenshotDetails._id);
    }
  };

  useEffect(() => {
    // start listening for key events
    document.addEventListener('keydown', handleArrowKeys, false);
  }, []);

  // componentWillUnmount() {
  //   // stop listening for key events
  //   document.removeEventListener('keydown', handleArrowKeys, false);
  // }

  const isSelectedId = (screenshotId) => {
    if (selectedScreenshotDetails
      && selectedScreenshotDetails._id === screenshotId) {
      return true;
    }
    return false;
  };

  const loadScreenshotKeyDown = (event) => {
    if (!Number.isNaN(event.key) && event.key > 0 && event.key < 10) {
      if (event.key <= screenshots.length) {
        loadScreenshot(screenshots[event.key - 1]._id);
      }
    }
  };

  const grabThumbnail = (screenshot) => {
    if (screenshot.thumbnail.startsWith('data:image')) {
      return screenshot.thumbnail;
    }
    return `data:image/png;base64, ${screenshot.thumbnail}`;
  };

  return (
    (!screenshots || screenshots.length === 0) ? (
      null
    ) : (
      <Carousel
        ref={setReference}
        swipeable
        draggable={false}
        showDots
        responsive={responsive}
        ssr // means to render carousel on server-side.
        infinite={false}
        autoPlay={false}
        autoPlaySpeed={1000}
        keyBoardControl={false}
        customTransition="transform 300ms ease-in-out"
        transitionDuration={500}
        containerClass="carousel-container"
        // focusOnSelect={true}
        // removeArrowOnDeviceType={["tablet", "mobile"]}
        deviceType={deviceType}
        dotListClass="custom-dot-list-style"
        itemClass="carousel-item-padding-30-px"
      >
        {
          screenshots ? (
            screenshots.map((screenshot, index) => (
              <div key={screenshot._id}>
                <div className={`card-text ${isSelectedId(screenshot._id) ? 'card-text-active' : ''}`}>
                  {`${index + 1} - ${screenshot.view ? screenshot.view : `screenshot-${index + 1}`}`}
                </div>
                <div
                  role="button"
                  onClick={() => loadScreenshot(screenshot._id)}
                  onKeyDown={(event) => loadScreenshotKeyDown(event)}
                  tabIndex={index + 1}
                >
                  <img
                    className={`card-screenshot-image ${isSelectedId(screenshot._id) ? 'card-active' : ''}`}
                    alt={screenshot.view}
                    src={`${grabThumbnail(screenshot)}`}
                  />
                </div>
              </div>
            ))) : ''
        }
      </Carousel>
    )
  );
};

export default ImageCarousel;
