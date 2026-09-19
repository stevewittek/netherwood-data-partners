"use client";

import { useState } from "react";
import { founderPortrait } from "../content/founder";

export function Portrait() {
  const [hasPortrait, setHasPortrait] = useState(Boolean(founderPortrait));

  return (
    <div className={`portrait-frame${hasPortrait ? "" : " portrait-frame-empty"}`}>
      {hasPortrait ? (
        <img
          src={founderPortrait || undefined}
          alt="Steven Wittek, founder of Netherwood Data Partners"
          onError={() => setHasPortrait(false)}
        />
      ) : (
        <div className="portrait-placeholder" aria-label="Steven Wittek monogram">
          <span className="portrait-initials" aria-hidden="true">SW</span>
          <span>Independent by design.<br />Personal by nature.</span>
        </div>
      )}
      <div className="portrait-caption">
        <span>New Jersey</span>
        <span>Independent consulting</span>
      </div>
    </div>
  );
}
