import React, { Component } from 'react';
import Carousel from 'react-multi-carousel';

class ImageCarousel extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    // start listening for key events
    this.addEventListener('keydown', this.handleArrowKeys, false);
  }

  componentWillUnmount() {
    // stop listening for key events
    this.removeEventListener('keydown', this.handleArrowKeys, false);
  }

  isSelectedId = (screenshotId) => {
    const { selectedScreenshotDetails } = this.props;
    if (selectedScreenshotDetails
      && selectedScreenshotDetails._id === screenshotId) {
      return true;
    }
    return false;
  }

  handleArrowKeys = (event) => {
    const { selectedScreenshotDetails } = this.props;
    if (event.keyCode === 37) {
      // left - previous
      this.getPreviousImage(selectedScreenshotDetails._id);
    }
    if (event.keyCode === 39) {
      // right - next
      this.getNextImage(selectedScreenshotDetails._id);
    }
  }

  getNextImage = (currentScreenshotId) => {
    const { screenshots, loadScreenshot } = this.props;
    const index = screenshots.findIndex((screenshot) => screenshot._id === currentScreenshotId);
    const nextIndex = index + 1;
    if (nextIndex < screenshots.length) {
      loadScreenshot(screenshots[nextIndex]._id);
      this.Carousel.goToSlide(nextIndex, false);
    }
  }

  getPreviousImage = (currentScreenshotId) => {
    const { screenshots, loadScreenshot } = this.props;
    const index = screenshots.findIndex((screenshot) => screenshot._id === currentScreenshotId);
    const nextIndex = index - 1;
    if (nextIndex >= 0) {
      loadScreenshot(screenshots[nextIndex]._id);
      this.Carousel.goToSlide(nextIndex, false);
    }
  }

  loadScreenshotKeyDown = (event) => {
    const { screenshots, loadScreenshot } = this.props;
    if (!Number.isNaN(event.key) && event.key > 0 && event.key < 10) {
      loadScreenshot(screenshots[event.key]._id);
    }
  }

  render() {
    const { screenshots, loadScreenshot, deviceType } = this.props;
    const responsive = {
      desktopxxl: {
        breakpoint: { max: 5000, min: 2500 },
        items: 6,
        slidesToSlide: 2, // optional, default to 1.
      },
      desktopxl: {
        breakpoint: { max: 2500, min: 1400 },
        items: 5,
        slidesToSlide: 2, // optional, default to 1.
      },
      desktop: {
        breakpoint: { max: 1400, min: 1130 },
        items: 4,
        slidesToSlide: 2, // optional, default to 1.
      },
      tablet: {
        breakpoint: { max: 1130, min: 830 },
        items: 3,
        slidesToSlide: 1, // optional, default to 1.
      },
      mobile: {
        breakpoint: { max: 830, min: 0 },
        items: 2,
        slidesToSlide: 1, // optional, default to 1.
      },
    };

    if (!screenshots || screenshots.length === 0) {
      return null;
    }

    const setRefercence = (el) => {
      this.Carousel = el;
    };

    return (
      <Carousel
        ref={setRefercence}
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
                <div className={`card-text ${this.isSelectedId(screenshot._id) ? 'card-text-active' : ''}`}>
                  {`${index + 1} - ${screenshot.view ? screenshot.view : `screenshot-${index + 1}`}`}
                </div>
                <div
                  role="button"
                  onClick={() => loadScreenshot(screenshot._id)}
                  onKeyDown={(event) => this.loadScreenshotKeyDown(event)}
                  tabIndex={index + 1}
                >
                  <img
                    className={`${this.isSelectedId(screenshot._id) ? 'card-active' : ''}`}
                    style={{ height: 250 }}
                    alt={screenshot.view}
                    src={`data:image/png;base64, ${screenshot.thumbnail}`}
                  />
                </div>
              </div>
            ))) : ''
        }
      </Carousel>
    );
  }
}

export default ImageCarousel;
