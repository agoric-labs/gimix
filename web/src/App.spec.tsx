import "./installSesLockdown.js";
import { render, screen } from "@testing-library/react";
import App from "./App.tsx";
import { ContextProviders } from "./contexts/providers.tsx";

describe("App.tsx", () => {
  it("renders app title", async () => {
    render(
      <ContextProviders>
        <App />
      </ContextProviders>
    );

    const titleElement = await screen.findByText("GiMiX");
    expect(titleElement).toBeTruthy();
  });
});
