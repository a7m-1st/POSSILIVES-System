import "./Footer.css";
import { Col, Container, Row } from "reactstrap";
// import { links } from "../../pages/Home/Home.tsx";


const Footer = () => {
  const links = {
    linkedin: 'https://www.linkedin.com/in/ahmed-awelkair-ahmed-abdalla-955116306/',
    instagram: 'https://www.instagram.com/a7m_1st/',
    phonenumber: 'tel:+601172358440',
    email: 'mailto:ahmed.jimi.awelkeir@gmail.com',
    github: 'https://github.com/a7m-1st',
    resources: 'https://drive.google.com/drive/folders/1peJWYmRUyrRhd1a2nHtEZqzkEo1_9sEj?usp=sharing',
    threads: 'https://www.threads.net/@a7m_1st'
  }
  //Buttons
  const openLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <section id="Contact Me"/>
      
      <Container>
        <Row className="d-flex my-3">
          <p className="text-center">Made with 💙 by Ahmed Awelkair</p>
        </Row>
        
        <Row className="d-flex mt-3">
          <div className="d-flex flex-row justify-content-center">
            <p className="text-secondary">Powered by</p>
            <i className="mt-1 ms-1 devicon-react-original text-black"></i>
            <i className="mt-1 ms-1 devicon-mongodb-plain text-black"></i>
            <i className="mt-1 ms-1 devicon-typescript-plain text-black"></i>
            <i className="mt-1 ms-1 devicon-threejs-original text-black" ></i>
          </div>
          <small className="text-center text-secondary">
            © All rights reserved | Version{" "}
            {require("../../../package.json").version}
          </small>
        </Row>
      </Container>
    </>
  );
};

export default Footer;
