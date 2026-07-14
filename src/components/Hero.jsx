import GalleryScene from './GalleryScene';
import './Hero.css';

const Hero = () => (
    <section id="home" className="orbit-hero" aria-labelledby="orbit-title">
        <div className="orbit-hero__grid" aria-hidden="true" />
        <GalleryScene />
        <header className="orbit-hero__identity">
            <strong id="orbit-title">CHAIMONGKON SOKGAMPANG</strong>
            <span>SOFTWARE ENGINEER</span>
        </header>
        <footer className="orbit-hero__footer">
            <span>SELECTED SYSTEMS / 24</span>
            <span>DRAG TO ORBIT</span>
        </footer>
    </section>
);

export default Hero;
