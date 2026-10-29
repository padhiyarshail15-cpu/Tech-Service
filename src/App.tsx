import heroImg from "@/assets/hero.png";
import reactLogo from "@/assets/react.svg";
import viteLogo from "@/assets/vite.svg";
import { Counter } from "@/components/Counter/Counter";
import { EnvBadge } from "@/components/EnvBadge/EnvBadge";
import { LinkList } from "@/components/LinkList/LinkList";
import { SpriteIcon } from "@/components/SpriteIcon/SpriteIcon";
import { appConfig } from "@/config/env";
import { DOC_LINKS, SOCIAL_LINKS } from "@/constants/links";
import "./App.css";

function App() {
  return (
    <>
      <EnvBadge env={appConfig.env} />
      {/* Test App title and description */}
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started Test</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test file<code>HMR</code>
          </p>
        </div>
        <Counter />
      </section>

      <div className="ticks" />

      <section id="next-steps">
        <div id="docs">
          <SpriteIcon id="documentation-icon" className="icon" />
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <LinkList links={DOC_LINKS} />
        </div>
        <div id="social">
          <SpriteIcon id="social-icon" className="icon" />
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <LinkList links={SOCIAL_LINKS} />
        </div>
      </section>

      <div className="ticks" />
      <section id="spacer" />
    </>
  );
}

export default App;
