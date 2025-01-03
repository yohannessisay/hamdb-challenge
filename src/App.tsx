import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { db } from "../firebase.js";
import backgroundImage from "./assets/mainBg.png";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [weekData, setWeekData] = useState<
    { name: string; value: Timestamp }[]
  >([]);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    generateWeeks();
  }, []);

  const generateWeeks = useCallback(() => {
    const weeks: { name: string; value: Timestamp }[] = [];
    const now = new Date("2024-01-01");
    const year = now.getFullYear();
    let startOfYear = new Date(year, 0, 1);

    for (let i = 1; i <= 52; i++) {
      const weekStart = new Date(startOfYear);
      weekStart.setDate(startOfYear.getDate() + (i - 1) * 7);

      const weekStartTimestamp = Timestamp.fromDate(weekStart);

      weeks.push({
        name: `Week ${i}`,
        value: weekStartTimestamp,
      });
    }
    setWeekData(weeks);
    fetchWeeklyDataForWeek(weeks[0]?.value);
  }, []);

  const handleWeekChange = async (index: number) => {
    const selectedWeek = weekData[index];
    setSelectedWeekIndex(index);
    await fetchWeeklyDataForWeek(selectedWeek.value);
  };

  const fetchWeeklyDataForWeek = async (selectedTimestamp: Timestamp) => {
    setLoading(() => {
      return true;
    });
    try {
      const startOfWeekDate = selectedTimestamp.toDate();

      const endOfWeekDate = new Date(startOfWeekDate);
      // set end of week to be 7
      endOfWeekDate.setDate(startOfWeekDate.getDate() + 6);

      const colRef = collection(db, "LogBookContact");

      const startTimestamp = Timestamp.fromDate(startOfWeekDate);
      const endTimestamp = Timestamp.fromDate(endOfWeekDate);

      const q = query(
        colRef,
        where("timestamp", ">=", startTimestamp),
        where("timestamp", "<=", endTimestamp)
      );

      const snapshot = await getDocs(q);
      const weeklyData: Record<string, number> = {};
      const daysOfWeek = [];
      //Fill in the days of the week array with 7 slots
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeekDate);
        day.setDate(startOfWeekDate.getDate() + i);
        const dayKey = `${day.getMonth() + 1}/${day.getDate()}`;
        daysOfWeek.push(dayKey);
        weeklyData[dayKey] = 0;
      }

      snapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp.toDate();
        const dayKey = `${timestamp.getMonth() + 1}/${timestamp.getDate()}`;
        weeklyData[dayKey] = (weeklyData[dayKey] || 0) + 1;
      });

      const updatedLabels = Object.keys(weeklyData);
      const updatedData = Object.values(weeklyData);

      setChartData(
        updatedLabels.map((label, index) => ({
          name: label,
          value: updatedData[index],
        }))
      );
      setLoading(() => {
        return false;
      });
    } catch (error) {
      console.error("Error fetching weekly data:", error);
    }
  };

  const handleArrowClick = (direction: "left" | "right") => {
    const newIndex =
      direction === "left"
        ? (selectedWeekIndex - 1 + weekData.length) % weekData.length
        : (selectedWeekIndex + 1) % weekData.length;
    handleWeekChange(newIndex);
  };

  return (
    <div className="h-screen ">
      <div
        className="px-64 w-full bg-inherit bg-center "
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="bg-[#0a0b39] px-4 rounded-md">
          <div className="flex justify-between border-b-4 border-[#85859c] mt-32">
            <h2 className="text-4xl mb-4 font-play m-4">
              Number of Contacts Per Day
            </h2>
            <svg
              fill="#85859c"
              xmlns="http://www.w3.org/2000/svg"
              width="20px"
              height="20px"
              viewBox="0 0 52 52"
              className="mt-4"
              enable-background="new 0 0 52 52"
              xmlSpace="preserve"
            >
              <path
                d="M26,2C12.7,2,2,12.7,2,26s10.7,24,24,24s24-10.7,24-24S39.3,2,26,2z M26,14.1c1.7,0,3,1.3,3,3s-1.3,3-3,3
                s-3-1.3-3-3S24.3,14.1,26,14.1z M31,35.1c0,0.5-0.4,0.9-1,0.9h-3c-0.4,0-3,0-3,0h-2c-0.5,0-1-0.3-1-0.9v-2c0-0.5,0.4-1.1,1-1.1l0,0
                c0.5,0,1-0.3,1-0.9v-4c0-0.5-0.4-1.1-1-1.1l0,0c-0.5,0-1-0.3-1-0.9v-2c0-0.5,0.4-1.1,1-1.1h6c0.5,0,1,0.5,1,1.1v8
                c0,0.5,0.4,0.9,1,0.9l0,0c0.5,0,1,0.5,1,1.1V35.1z"
              />
            </svg>
          </div>
          <div className="flex justify-between items-center relative gap-[25px] my-4">
            <span></span>
            <div className="flex items-center gap-4">
              <svg
                width={9}
                height={14}
                viewBox="0 0 9 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
                preserveAspectRatio="none"
                onClick={() => handleArrowClick("left")}
              >
                <path
                  d="M4.5897e-07 7L9 0.5L9 13.5L4.5897e-07 7Z"
                  fill="#17F9DA"
                />
              </svg>
              <p className="text-xl font-bold text-center font-play">
                {weekData[selectedWeekIndex]?.name || "Loading..."}
              </p>
              <svg
                width={9}
                height={14}
                viewBox="0 0 9 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
                preserveAspectRatio="none"
                onClick={() => handleArrowClick("right")}
              >
                <path
                  d="M9 7L3.57352e-08 13.5L9.53674e-07 0.5L9 7Z"
                  fill="#17F9DA"
                />
              </svg>
            </div>

            <div className="flex justify-end">
              <span className="text-base font-medium text-right">February</span>
            </div>
          </div>

          <div className=" w-full flex  ">
            {!loading ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#adadad" strokeWidth={0.5} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    dot={{
                      r: 4,
                      fill: "#17F9DA",
                      stroke: "#17F9DA",
                      strokeWidth: 1,
                    }}
                    type="linear"
                    dataKey="value"
                    stroke="#17F9DA"
                    fill="#17F9DA"
                    fillOpacity={0.3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
             <div className="flex justify-center items-center w-full my-12">
                <div
                  className="w-12 h-12 rounded-full animate-spin
                    border-2 border-solid border-[#3437e8] border-t-transparent"
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="h-[50vh] w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      ></div>
    </div>
  );
}
