'use client';

import Ubuntu from "../components/ubuntu";
import ReactGA from 'react-ga4';
import { useEffect } from 'react';

const TRACKING_ID = process.env.NEXT_PUBLIC_TRACKING_ID;

export default function Home() {
  useEffect(() => {
    if (TRACKING_ID) {
      ReactGA.initialize(TRACKING_ID);
    }
  }, []);

  return (
    <Ubuntu />
  );
}
