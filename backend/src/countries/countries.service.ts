import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CountriesService {
  private nagerDateApi = process.env.NAGER_DATE_API_BASE_URL;
  private countriesNowApi = process.env.COUNTRIES_NOW_BASE_URL;

  async getAvailableCountries() {
    const response = await axios.get(`${this.nagerDateApi}/AvailableCountries`);
    return response.data;
  }

  async getCountryInfo(countryCode: string) {
    try {
      // Border Countries
      const borderResponse = await axios.get(
        `${this.nagerDateApi}/CountryInfo/${countryCode}`,
      );

      // Population Data
      const populationResponse = await axios.post(
        `${this.countriesNowApi}/population`,
        {
          country: borderResponse.data.commonName,
        },
      );

      // Flag URL
      const flagResponse = await axios.post(
        `${this.countriesNowApi}/flag/images`,
        {
          iso2: borderResponse.data.countryCode,
        },
      );

      return {
        ...borderResponse.data,
        population: populationResponse.data.data,
        flagUrl: flagResponse.data.data.flag,
      };
    } catch (error: unknown) {
      console.error(error);
      throw new Error('Failed to fetch country information');
    }
  }
}
