import { render, screen, fireEvent } from "@testing-library/react";
import HeroSubNav from "../HeroSubNav";

describe("HeroSubNav", () => {
  it("renders navigation links for services, portfolio, and contact", () => {
    render(<HeroSubNav />);

    expect(screen.getByRole("navigation")).toHaveClass("hero-subnav");
    expect(screen.getByRole("link", { name: /services/i })).toHaveAttribute("href", "#services");
    expect(screen.getByRole("link", { name: /our work/i })).toHaveAttribute("href", "#portfolio");
    expect(screen.getByRole("link", { name: /contact/i })).toHaveAttribute("href", "#contact");
  });

  it("prevents default and scrolls target into view when element exists", () => {
    const scrollIntoView = jest.fn();
    const target = document.createElement("div");
    target.id = "services";
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);

    render(<HeroSubNav />);

    const link = screen.getByRole("link", { name: /services/i });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const preventDefault = jest.spyOn(event, "preventDefault");
    fireEvent(link, event);

    expect(preventDefault).toHaveBeenCalled();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    document.body.removeChild(target);
  });

  it("does not throw when target id is missing", () => {
    render(<HeroSubNav />);
    const link = screen.getByRole("link", { name: /our work/i });

    expect(() => fireEvent.click(link)).not.toThrow();
  });
});
