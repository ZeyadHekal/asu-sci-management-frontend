import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import {
  FaUsers,
  FaFlask,
  FaMoneyBillWave,
  FaUserGraduate,
  FaClock,
} from "react-icons/fa";
import ReactApexChart from "react-apexcharts";
import StatAreaCard from "../components/StatAreaCard";
import StatProgressCard from "../components/StatProgressCard";
import { useAuthStore } from "../../../store/authStore";

const DashboardPage = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const hasPrivilege = useAuthStore((state) => state.hasPrivilege);
  const isStudent = !hasPrivilege("MANAGE_COURSES") && !hasPrivilege("TEACH_COURSE") && !hasPrivilege("ASSIST_IN_COURSE");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  //All Devices
  const allDevices: any = {
    series: [200, 500, 300, 300],
    options: {
      chart: {
        type: "donut",
        height: 460,
        fontFamily: "Nunito, sans-serif",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 25,
        colors: "#fff",
      },
      colors: ["#00AB55", "#4361EE", "#E2A03F", "#E7515A"],
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "14px",
        markers: {
          width: 10,
          height: 10,
          offsetX: -2,
        },
        height: 50,
        offsetY: 20,
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            background: "transparent",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "29px",
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: "26px",
                color: undefined,
                offsetY: 16,
                formatter: (val: any) => {
                  return val;
                },
              },
              total: {
                show: true,
                label: "Total",
                color: "#888ea8",
                fontSize: "29px",
                formatter: (w: any) => {
                  return w.globals.seriesTotals.reduce(function (
                    a: any,
                    b: any
                  ) {
                    return a + b;
                  },
                  0);
                },
              },
            },
          },
        },
      },
      labels: [
        "Available",
        "Under Maintenance",
        "Need a Maintenance",
        "Unavailable",
      ],
      states: {
        hover: {
          filter: {
            type: "none",
            value: 0.15,
          },
        },
        active: {
          filter: {
            type: "none",
            value: 0.15,
          },
        },
      },
    },
  };

  // Stat card data
  const statCards = [
    {
      icon: <FaMoneyBillWave className="w-5 h-5" />,
      title: "Earning",
      value: "15,564,132 EGP",
      percent: "100%",
      comparison: "vs Last Year",
      color: "green",
      gradientId: "earning-gradient",
      gradientColors: { from: "#17B26A", to: "#17B26A" },
    },
    {
      icon: <FaUsers className="w-5 h-5" />,
      title: "Freshmen",
      value: 129,
      percent: "99%",
      comparison: "vs Last Year",
      color: "red",
      gradientId: "freshmen-gradient",
      gradientColors: { from: "#F04438", to: "#F04438" },
    },
    {
      icon: <FaClock className="w-5 h-5" />,
      title: "Course Hours",
      value: 311,
      percent: "45%",
      comparison: "vs This Year",
      color: "blue",
      gradientId: "coursehours-gradient",
      gradientColors: { from: "#2673DD", to: "#2673DD" },
    },
    {
      icon: <FaUserGraduate className="w-5 h-5" />,
      title: "Graduates",
      value: 101,
      percent: "96%",
      comparison: "vs Last Year",
      color: "yellow",
      gradientId: "graduates-gradient",
      gradientColors: { from: "#FDB751", to: "#FDB751" },
    },
  ];

  return (
    <div className="p-6 grid gap-6 grid-cols-1 xl:grid-cols-3">
      {/* Top Row */}
      <div className="col-span-1 xl:col-span-1">
        {/* Devices Donut Chart Card */}
        <div className="panel h-[460px] relative">
          <div className="flex items-center">
            <h5 className="text-xl font-semibold dark:text-white-light">
              All Devices
            </h5>
          </div>
          <div>
            <div className="flex justify-center items-center">
              {isMounted ? (
                <ReactApexChart
                  series={allDevices.series}
                  options={allDevices.options}
                  type="donut"
                  width={"450px"}
                />
              ) : (
                <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                  <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-1 xl:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Middle Row */}
      <div className="col-span-1 xl:col-span-3 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <StatAreaCard
          icon={<FaUsers className="h-5 w-5" />}
          title="Students"
          value={712}
          gradientFrom="#5F855C"
          gradientTo="#5F855C"
        />
        <StatAreaCard
          icon={<FaUsers className="h-5 w-5" />}
          title="Doctors"
          value={21}
          gradientFrom="#284D25"
          gradientTo="#284D25"
          areaPath="M15 155C6.71572 155 0 148.284 0 140V10C0 1.71573 6.77444 -3.05139 11.5139 3.7432C26.6901 25.5 40.7681 80.3333 56.6667 80.3333C76.5 80.3333 93.5 16.3333 113.333 16.3333C133.167 16.3333 150.167 53.6667 170 53.6667C189.833 53.6667 206.833 48.3333 226.667 48.3333C246.5 48.3333 263.5 59 283.333 59C298.02 59 311.153 56.0755 325.033 54.5577C333.268 53.6572 340 60.3715 340 68.6558C340 80.5287 340 101.806 340 139.938C340 148.222 333.284 155 325 155H15Z"
        />
        <StatAreaCard
          icon={<FaFlask className="h-5 w-5" />}
          title="Labs"
          value={10}
          gradientFrom="#284D25"
          gradientTo="#284D25"
          areaPath="M15 160C6.71572 160 0 153.284 0 145V73.6667C0 65.3824 7.02006 57.4854 12.6922 51.4475C27.4213 35.7685 41.1803 0 56.6667 0C76.5 0 93.5 58.6667 113.333 58.6667C133.167 58.6667 150.167 21.3333 170 21.3333C189.833 21.3333 206.833 64 226.667 64C246.5 64 263.5 53.3333 283.333 53.3333C298.353 53.3333 311.747 71.6845 325.978 80.5929C333 84.9886 340 92.0241 340 100.308C340 109.068 340 122.952 340 144.957C340 153.241 333.284 160 325 160H15Z"
        />
      </div>

      {/* Bottom Row */}
      <div className="col-span-1 xl:col-span-3 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StatProgressCard
          title="Cap"
          subtitle="712 Students"
          progress={92}
          progressLabel="92%"
          topRight={<span>This Year</span>}
          menu={
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          }
        />
        <StatProgressCard
          title="This Semester"
          subtitle="45 Days Left"
          progress={92}
          progressLabel="92%"
          topRight={<span>Fall 2025</span>}
          menu={
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          }
        />
      </div>
    </div>
  );
};

export default DashboardPage;
