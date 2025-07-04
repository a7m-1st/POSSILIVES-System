import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "./Footer.tsx";
import Navbar from "./Navbar/Navbar.tsx";
import Loading from "./Loading/Loading.tsx";
import LoadingContext from "../../hooks/LoadingContext.tsx";

const Layout = () => {
  const { loading } = React.useContext(LoadingContext);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("userId");
    if (data === null) {
      navigate("/login");
    }
  }, []);
  return (
    <div>
      {/* <Header /> */}
      {/* Outlet render show all the router nested children */}
      <Navbar />
      <div className="default-window-footer">
        {loading ? <Loading loading={loading} /> : 

        <div className="container mx-auto px-5 my-4 md:my-8">
          <Outlet />
        </div>
        }
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
