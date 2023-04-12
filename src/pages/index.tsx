import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { z } from "zod";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import Header from "./components/Header";

const appointmentFormSchema = z.object({
  clientName: z.string().min(1, "Client name is required."),
  clientPhone: z.string().min(1, "Client phone is required."),
  carColor: z.string().min(1, "Car color is required."),
  carLicense: z.string().min(1, "Car license is required."),
  carEngine: z.string().min(1, "Car engine is required."),
  appointmentDate: z.string().min(1, "Appointment date is required."),
  mechanicId: z.number().int().min(1, "Please select a mechanic."),
});

const Home: NextPage = () => {
  const { data } = api.mechanic.getAll.useQuery();

  const createAppointment = api.appointment.create.useMutation({
    onError(error) {
      console.log(error);
      toast.error(error.message);
    },
    onSuccess() {
      toast.success("Appointment has been created");
      resetForm();
    },
  });

  const [formValues, setFormValues] = useState({
    clientName: "",
    clientPhone: "",
    carColor: "",
    carLicense: "",
    carEngine: "",
    appointmentDate: "",
    mechanicId: 0,
  });

  const resetForm = () => {
    setFormValues({
      clientName: "",
      clientPhone: "",
      carColor: "",
      carLicense: "",
      carEngine: "",
      appointmentDate: "",
      mechanicId: 0,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [e.currentTarget.name]: e.currentTarget.value,
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormValues({
      ...formValues,
      [e.currentTarget.name]: +e.currentTarget.value,
    });
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    // Submit the form data using the api
    try {
      const validatedFormValues = appointmentFormSchema.parse(formValues);
      createAppointment.mutate(validatedFormValues);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(
          error.errors[0]?.message ||
            "An error occurred while validating the form."
        );
      } else {
        toast.error("An error occurred while creating the appointment.");
      }
    }
  };

  return (
    <>
      <Head>
        <title>CarWorkshop</title>
        <meta name="description" content="Get your cars repaired" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-10">
          <div className="flex">
            <div className="w-1/2 pr-8">
              <h1 className="mb-4 text-4xl font-bold">
                Welcome to CarWorkshop!
              </h1>
              <p className="mb-4 text-gray-700">
                We provide the best service for your car. Book an appointment
                with our skilled mechanics and get your car back on the road!
              </p>
              <ul className="mb-4 space-y-2 text-gray-700">
                <li>
                  <i className="fas fa-check mr-2 text-green-500"></i>Expert
                  Mechanics
                </li>
                <li>
                  <i className="fas fa-check mr-2 text-green-500"></i>Quality
                  Service
                </li>
                <li>
                  <i className="fas fa-check mr-2 text-green-500"></i>
                  Competitive Pricing
                </li>
                <li>
                  <i className="fas fa-check mr-2 text-green-500"></i>Fast
                  Turnaround
                </li>
              </ul>
            </div>
            <div className="w-1/2">
              <div className="rounded-lg bg-white p-8 shadow-md">
                <h1 className="mb-4 font-bold text-gray-800">
                  Appointment Form
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="text-gray-700">
                    Client Name
                    <input
                      name="clientName"
                      value={formValues.clientName}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="text-gray-700">
                    Client Phone
                    <input
                      name="clientPhone"
                      value={formValues.clientPhone}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="text-gray-700">
                    Car Color
                    <input
                      name="carColor"
                      value={formValues.carColor}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="text-gray-700">
                    Car License
                    <input
                      name="carLicense"
                      value={formValues.carLicense}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="text-gray-700">
                    Car Engine
                    <input
                      name="carEngine"
                      value={formValues.carEngine}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="text-gray-700">
                    Appointment Date
                    <input
                      name="appointmentDate"
                      value={formValues.appointmentDate}
                      onChange={handleInputChange}
                      type="date"
                      className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="text-gray-700">
                    Mechanic
                    <select
                      name="mechanicId"
                      value={formValues.mechanicId}
                      onChange={handleSelectChange}
                      className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a mechanic</option>
                      {data?.map((mechanic) => (
                        <option key={mechanic.id} value={mechanic.id}>
                          {mechanic.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="rounded bg-blue-500 px-4 py-2 text-white"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
