"use client";

import { useState } from "react";
import Image from "next/image";

export function Portrait() {
  const [hasPortrait, setHasPortrait] = useState(true);

  return (
    <div className={`portrait-frame${hasPortrait ? "" : " portrait-frame-empty"}`}>
      {hasPortrait ? (
        <Image
          src="/images/steven-wittek.jpg"
          alt="Steven Wittek, founder of Netherwood Data Partners"
          fill
          sizes="(max-width: 900px) 100vw, 40vw"
          onError={() => setHasPortrait(false)}
        />
      ) : (
        <div className="portrait-placeholder" aria-label="Portrait placeholder for Steven Wittek">
          <span className="portrait-initials" aria-hidden="true">SW</span>
          <span>Portrait placeholder</span>
        </div>
      )}
      <div className="portrait-caption">
        <span>New Jersey</span>
        <span>Independent consulting</span>
      </div>
    </div>
  );
}
