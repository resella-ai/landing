import { hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import "lenis/dist/lenis.css";
import "./reference.css";

hydrateRoot(document.getElementById("root"), <App />);
