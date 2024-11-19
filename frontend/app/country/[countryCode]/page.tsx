'use client';

import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface PopulationData {
  year: number;
  value: number;
}

interface CountryInfo {
  commonName: string;
  flagUrl: string;
  borders: {
    commonName: string;
    countryCode: string;
  }[];
  population: PopulationData[];
}

async function fetchCountryInfo(countryCode: string): Promise<CountryInfo> {
  try {
    const response = await axios.get(
      `http://localhost:3001/countries/${countryCode}`
    );

    return {
      ...response.data,
      population: response.data.population.populationCounts,
    };
  } catch (error) {
    throw new Error('Failed to fetch country information');
  }
}

export default function CountryDetails() {
  const { countryCode } = useParams();
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryCode || Array.isArray(countryCode)) {
      setError('Invalid country code');
      return;
    }

    fetchCountryInfo(countryCode)
      .then(setCountryInfo)
      .catch(() => setError('Failed to fetch country information'));
  }, [countryCode]);

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">{error}</p>
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Country List
        </Link>
      </div>
    );
  }

  if (!countryInfo) {
    return <p className="container mx-auto p-4">Loading...</p>;
  }

  const populationData = countryInfo.population.map((pop) => ({
    year: pop.year,
    population: pop.value,
  }));

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <Image
          src={countryInfo.flagUrl}
          alt={`${countryInfo.commonName} flag`}
          width={64}
          height={40}
          className="mr-4"
        />
        <h1 className="text-3xl font-bold">{countryInfo.commonName}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Border Countries</h2>
          <div className="grid grid-cols-3 gap-2">
            {countryInfo.borders.map((border) => (
              <Link
                key={border.countryCode}
                href={`/country/${border.countryCode}`}
                className="p-2 border rounded hover:bg-gray-100 hover:text-stone-950"
              >
                {border.commonName}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 h-[400px]">
          <h2 className="text-xl font-semibold mb-2">Population Over Time</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={populationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis
                dataKey={'population'}
                tickFormatter={(value) =>
                  value >= 1_000_000_000
                    ? `${(value / 1_000_000_000).toFixed(1)}B`
                    : value >= 1_000_000
                    ? `${(value / 1_000_000).toFixed(1)}M`
                    : value
                }
              />
              <Tooltip
                formatter={(value) => `${(value as number).toLocaleString()}`}
              />
              <Line
                type="monotone"
                dataKey="population"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
