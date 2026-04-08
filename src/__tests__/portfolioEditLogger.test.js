    import axios from "axios";
    import {
    startTracking,
    stopTracking,
    logPortfolioAction,
    getSessionId,
    updatePortfolioInfo,
    } from "../utils/portfolioEditLogger";

    jest.mock("axios");

    describe("portfolioEditLogger", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test("startTracking sets session and attaches listeners", () => {
        const addSpy = jest.spyOn(document, "addEventListener");

        startTracking({
        sessionId: "sess-1",
        userId: "user-1",
        portfolioID: "p-1",
        portfolioType: "handyman",
        name: "Test User",
        email: "test@example.com",
        });

        expect(getSessionId()).toBe("sess-1");
        // Called for click, mousemove, mouseover
        expect(addSpy).toHaveBeenCalledWith("click", expect.any(Function));
        expect(addSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
        expect(addSpy).toHaveBeenCalledWith("mouseover", expect.any(Function));

        addSpy.mockRestore();
    });

    test("logPortfolioAction handles errors gracefully", async () => {
    startTracking({ sessionId: "sess-error", userId: "user-error" });

    const error = new Error("network down");
    axios.post.mockRejectedValueOnce(error);

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await logPortfolioAction("deleted");

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
    });


    test("getSessionId falls back to localStorage or Date.now()", () => {
    // Reload module fresh so there is no existing sessionIdRef
    jest.resetModules();
    localStorage.clear();

    // Re-require the module AFTER resetModules
     
    const { getSessionId } = require("../utils/portfolioEditLogger");

    // 1) When onboardingSessionId exists in localStorage
    localStorage.setItem("onboardingSessionId", "stored-session");
    expect(getSessionId()).toBe("stored-session");

    // 2) When nothing in localStorage → generates new session string
    localStorage.removeItem("onboardingSessionId");
    const id = getSessionId();
    expect(id).toMatch(/^session_/);
    });




    test("collects mouse events and sends them in log", async () => {
    jest.useFakeTimers();

    startTracking({
        sessionId: "sess-events",
        userId: "user-events",
        portfolioID: "p-events",
        portfolioType: "vendor",
        name: "Mouse User",
        email: "mouse@example.com",
    });

    axios.post.mockResolvedValueOnce({});

    // Create a real DOM element so event.target is valid
    const btn = document.createElement("button");
    btn.id = "save-btn";
    btn.className = "btn primary";
    document.body.appendChild(btn);

    // Dispatch multiple events quickly (throttle will limit calls but still cover code)
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 10, clientY: 20 }));
    btn.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 15, clientY: 25 }));

    // Run any pending throttled timers
    jest.runOnlyPendingTimers();

    await logPortfolioAction("updated");

    expect(axios.post).toHaveBeenCalledTimes(1);
    const [, payload] = axios.post.mock.calls[0];

    // We should have captured at least one mouse event
    expect(payload.mouseInfo.length).toBeGreaterThan(0);
    expect(payload.mouseInfo[0]).toMatchObject({
        x: expect.any(Number),
        y: expect.any(Number),
        element: expect.any(String),
    });

    jest.useRealTimers();
    });


    test("stopTracking removes listeners", () => {
        const removeSpy = jest.spyOn(document, "removeEventListener");

        startTracking({ sessionId: "sess-2" });
        stopTracking();

        expect(removeSpy).toHaveBeenCalledWith("click", expect.any(Function));
        expect(removeSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
        expect(removeSpy).toHaveBeenCalledWith("mouseover", expect.any(Function));

        removeSpy.mockRestore();
    });

    test("logPortfolioAction posts log data with axios", async () => {
        startTracking({
        sessionId: "sess-3",
        userId: "user-3",
        portfolioID: "p-3",
        portfolioType: "vendor",
        name: "Alice",
        email: "alice@example.com",
        });

        axios.post.mockResolvedValueOnce({});

        await logPortfolioAction("created");

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, payload] = axios.post.mock.calls[0];

        expect(url).toMatch(/\/api\/portfolio-edit-log$/);
        expect(payload).toMatchObject({
        action: "created",
        sessionId: "sess-3",
        portfolioType: "vendor",
        });
    });

    test("updatePortfolioInfo merges extra info into subsequent logs", async () => {
        startTracking({ sessionId: "sess-4", userId: "user-4" });

        updatePortfolioInfo({
        portfolioID: "new-id",
        portfolioType: "photographer",
        });

        axios.post.mockResolvedValueOnce({});

        await logPortfolioAction("updated");

        const [, payload] = axios.post.mock.calls[0];

        expect(payload.portfolioID).toBe("new-id");
        expect(payload.portfolioType).toBe("photographer");
    });
    });
