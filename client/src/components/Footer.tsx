import { FaHeart } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="absolute bottom-1 w-full flex items-center justify-center gap-1.5 text-xl" style={
      { fontFamily: "'Baloo 2', sans-serif", }
    }>
      <span>Made with</span>
      <FaHeart color="var(--player-2-color)" />
      <span>By</span>
      <a
        className="hover:underline text-[var(--player-4-color)]"
        href="https://the-sofishticated-man.github.io"
      >
        <strong >The Sofishticated Man</strong>
      </a>
    </footer >

  );
};
export default Footer;
