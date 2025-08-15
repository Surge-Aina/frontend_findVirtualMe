import Banner from "../sections/Banner";
import About from "../sections/About";
import Menu from "../sections/Menu";
import Gallery from "../sections/Gallery";
import Reviews from "../sections/Reviews";
import TaggedShowcase from "../sections/TaggedShowcase";

const Home = () => {
  return (
    <>
      <Banner />
      <About />
      <Menu />
      <TaggedShowcase />
      <Gallery />
      <Reviews />
    </>
  );
};

export default Home;
