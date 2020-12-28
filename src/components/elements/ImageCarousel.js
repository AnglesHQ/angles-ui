import React, { Component } from 'react'
import Carousel from 'react-multi-carousel';

class ImageCarousel extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  isSelectedId = (screenshotId) => {
    if (this.props.selectedScreenshotDetails && this.props.selectedScreenshotDetails._id === screenshotId) {
      return true;
    } else {
      return false;
    }
  }

  handleArrowKeys = (event) => {
    if(event.keyCode === 37) {
      // left - previous
      this.getPreviousImage(this.props.selectedScreenshotDetails._id);
    }
    if(event.keyCode === 39) {
      // right - next
      this.getNextImage(this.props.selectedScreenshotDetails._id);
    }
  }

  getNextImage = (currentScreenshotId) => {
      const index = this.props.screenshots.findIndex(screenshot => screenshot._id === currentScreenshotId);
      let nextIndex = index+1;
      if (nextIndex < this.props.screenshots.length) {
        this.props.loadScreenshot(this.props.screenshots[nextIndex]._id);
        this.Carousel.goToSlide(nextIndex, false);
      }
  }

  getPreviousImage = (currentScreenshotId) => {
      const index = this.props.screenshots.findIndex(screenshot => screenshot._id === currentScreenshotId);
      let nextIndex = index-1;
      if (nextIndex >= 0) {
        this.props.loadScreenshot(this.props.screenshots[nextIndex]._id);
        this.Carousel.goToSlide(nextIndex, false);
      }
  }

  componentDidMount(){
    // start listening for key events
    document.addEventListener("keydown", this.handleArrowKeys, false);
  }
  componentWillUnmount(){
    // stop listening for key events
    document.removeEventListener("keydown", this.handleArrowKeys, false);
  }

  render () {

    const responsive = {
      desktopxxl: {
        breakpoint: { max: 5000, min: 2500 },
        items: 6,
        slidesToSlide: 2 // optional, default to 1.
      },
      desktopxl: {
        breakpoint: { max: 2500, min: 1400 },
        items: 5,
        slidesToSlide: 2 // optional, default to 1.
      },
      desktop: {
        breakpoint: { max: 1400, min: 1130 },
        items: 4,
        slidesToSlide: 2 // optional, default to 1.
      },
      tablet: {
        breakpoint: { max: 1130, min: 830 },
        items: 3,
        slidesToSlide: 1 // optional, default to 1.
      },
      mobile: {
        breakpoint: { max: 830, min: 0 },
        items: 2,
        slidesToSlide: 1 // optional, default to 1.
      }
    };

    if (!this.props.screenshots || this.props.screenshots.length === 0) {
      return null;
    }
    return <Carousel
        ref={(el) => (this.Carousel = el)}
        swipeable={true}
        draggable={false}
        showDots={true}
        responsive={responsive}
        ssr={true} // means to render carousel on server-side.
        infinite={false}
        autoPlay={false}
        autoPlaySpeed={1000}
        keyBoardControl={false}
        customTransition="transform 300ms ease-in-out"
        transitionDuration={500}
        containerClass="carousel-container"
        // focusOnSelect={true}
        // removeArrowOnDeviceType={["tablet", "mobile"]}
        deviceType={this.props.deviceType}
        dotListClass="custom-dot-list-style"
        itemClass="carousel-item-padding-30-px"
      >
        {
          this.props.screenshots ? (
            this.props.screenshots.map((screenshot, index)  =>
              <div key={index}>
                <div className={`card-text ${ this.isSelectedId(screenshot._id) ? "card-text-active" : ""}`}>{index + 1} - {screenshot.view}</div>
                <img
                  className={`${ this.isSelectedId(screenshot._id) ? "card-active" : ""}`}
                  style={{ height: 250}} alt={screenshot.view}
                  src={"data:image/png;base64, " + screenshot.thumbnail}
                  onClick={(sh) => this.props.loadScreenshot(screenshot._id)}
                />
              </div>
            )
          ) : ""
        }
      </Carousel>
  }
};

export default ImageCarousel
