import './styles/tailwind.css';
import { render } from "hono/jsx/dom";
import App from "./App";

render(<App />, document.getElementById("app")!);
