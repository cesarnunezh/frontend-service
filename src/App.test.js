import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the app title", () => {
  render(<App />);
  const titleElement = screen.getByText(/devops ecommerce/i);
  expect(titleElement).toBeInTheDocument();
});

test("renders product loading message", () => {
  render(<App />);
  const loadingElement = screen.getByText(/loading products from `product-service`/i);
  expect(loadingElement).toBeInTheDocument();
});