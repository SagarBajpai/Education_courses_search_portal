import React from "react";
const Header = () => {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light" style={style.nav}>
        <div className="navbar-brand">
          <img
            src="https://cdn1.byjus.com/home/logo.svg"
            alt="byjus.com"
            width="170"
            height="55"
          />
        </div>
      </nav>
    </div>
  );
};

const style = {
  nav: {
    top: 0,
    backgroundColor: "rgb(129, 53, 136)",
    maxHeight: "340px"
  },
  logo: {
    width: "170px"
  }
};

export default Header;
