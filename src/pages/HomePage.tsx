import React from "react";

const HomePage: React.FC = () => {
  return (
    <section className="page home-page">
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Capture Without
            <br />
            Owning
          </h1>
          <p className="hero-subtitle">
            Because owning expensive gear is sooo last season.
            <br />
            Rent it, shoot it, slay it.
          </p>
          <div className="hero-buttons">
            <a href="/products" className="btn btn-primary">
              Explore Gears
            </a>
            <a href="/rent" className="btn btn-secondary">
              Rent Now
            </a>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://product.hstatic.net/200000354621/product/may-anh-fujifilm-x-t4-kit-18-55-mau-bac-1_4d8855bb7c5a423d821ee2de196d4b18_grande.jpg"
            alt="Fujifilm X-T4 Camera"
          />
        </div>
      </div>
    </section>
  );
};

export default HomePage;
