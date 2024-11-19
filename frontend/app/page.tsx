"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Country {
  key: string;
  name: string;
  countryCode: string;
}

export default function Home() {
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("http://localhost:3001/countries");
        setCountries(response.data);
      } catch (error) {
        console.error("Error fetching countries", error);
      }
    };
    fetchCountries();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Countries</h1>
      <div className="grid grid-cols-3 gap-4">
        {countries.map((country) => (
          <Link
            key={country.key}
            href={`/country/${country.countryCode}`}
            className="p-4 border rounded hover:bg-gray-100 hover:text-stone-950"
          >
            {country.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
