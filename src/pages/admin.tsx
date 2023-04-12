import { type NextPage } from "next";
import Head from "next/head";
import Header from "./components/Header";
import { useEffect, useState } from "react";
import { type RouterOutputs, api } from "~/utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { z } from "zod";
import { format } from "date-fns";
import { type Mechanic } from "@prisma/client";

// Modal.setAppElement("#root");

type AppointmentWithMechanic = RouterOutputs["appointment"]["getAll"][number];

const Admin: NextPage = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState("appointments");

  const handleMenuItemClick = (menuItem: string) => {
    setSelectedMenuItem(menuItem);
  };

  return (
    <>
      <Head>
        <title>CarWorkshop - Admin</title>
      </Head>
      <main className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex">
          <div className=" pr-8">
            <div className="mt-4 flex min-h-min w-64 flex-col justify-start rounded-r-lg bg-gray-600 p-4 text-white">
              <button
                className={`p-4 text-left ${
                  selectedMenuItem === "appointments"
                    ? "bg-white text-black"
                    : "bg-gray-600"
                }`}
                onClick={() => handleMenuItemClick("appointments")}
              >
                Appointments
              </button>
              <button
                className={`p-4 text-left ${
                  selectedMenuItem === "mechanics"
                    ? "bg-white text-black"
                    : "bg-gray-600"
                }`}
                onClick={() => handleMenuItemClick("mechanics")}
              >
                Mechanics
              </button>
            </div>
          </div>
          <div className="flex-grow">
            {/* Content Area */}
            <div className="flex-1 items-center  p-8">
              {selectedMenuItem === "appointments" && <AppointmentList />}
              {selectedMenuItem === "mechanics" && <MechanicsList />}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

const updateAppointmentFormSchema = z.object({
  id: z.number(),
  appointmentDate: z.string().min(1, "Appointment date is required."),
  mechanicId: z.number().int().min(1, "Please select a mechanic."),
});

const mechanicFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Please enter the mechanic's name"),
  maxActiveCars: z
    .number()
    .min(1, "Minimum 1 car needs to be maintained by the mechanics"),
});

const AppointmentList: NextPage = () => {
  const utils = api.useContext();
  const appointments = api.appointment.getAll.useQuery();
  const mechanics = api.mechanic.getAll.useQuery();
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithMechanic>();

  const updateAppointment = api.appointment.update.useMutation({
    onError(error) {
      console.log(error);
      toast.error(error.message);
    },
    onSuccess() {
      toast.success("Appointment has been updated");
      handleCloseModal();
      void utils.appointment.getAll.invalidate();
    },
  });

  const [formValues, setFormValues] = useState({
    id: selectedAppointment?.id,
    appointmentDate: selectedAppointment?.appointmentDate.toLocaleString(),
    mechanicId: selectedAppointment?.mechanicId,
  });

  const handleOpenModal = () => {
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.currentTarget);
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
    setLoading(true);
    try {
      const validatedFormValues = updateAppointmentFormSchema.parse(formValues);
      updateAppointment.mutate(validatedFormValues);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(
          error.errors[0]?.message ||
            "An error occurred while validating the form."
        );
      } else {
        toast.error("An error occurred while updating the appointment.");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    setFormValues({
      id: selectedAppointment?.id,
      appointmentDate: format(
        selectedAppointment?.appointmentDate ?? new Date(),
        "yyyy-MM-dd"
      ),
      mechanicId: selectedAppointment?.mechanicId,
    });
  }, [
    selectedAppointment?.appointmentDate,
    selectedAppointment?.id,
    selectedAppointment?.mechanicId,
  ]);

  return (
    <>
      <div className="flex h-full flex-col  justify-start">
        {appointments.isLoading ? (
          <div className="flex h-full w-full flex-col items-center">
            <CircularProgress color="primary" size={50} />
          </div>
        ) : (
          <div>
            <Modal isOpen={modalIsOpen} onRequestClose={handleCloseModal}>
              <div className="flex flex-col items-start">
                <div className="flex w-full justify-end">
                  <button onClick={handleCloseModal}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <div className="w-70 p-4">
                  <h2 className="mb-8 font-bold">Update appointment</h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
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
                        {mechanics.data?.map((mechanic) => (
                          <option key={mechanic.id} value={mechanic.id}>
                            {mechanic.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="submit"
                      className="rounded bg-blue-500 px-4 py-2 text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress color="primary" size={24} />
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </Modal>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Client Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Mechanic Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Appointment Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {appointments.data?.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.clientName}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.mechanic.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.appointmentDate.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          handleOpenModal();
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

const MechanicsList: NextPage = () => {
  const utils = api.useContext();
  const mechanics = api.mechanic.getAll.useQuery();
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic>();

  const updateMechanic = api.mechanic.update.useMutation({
    onError(error) {
      console.log(error);
      toast.error(error.message);
    },
    onSuccess() {
      toast.success("Mechanic has been updated");
      handleCloseModal();
      void utils.mechanic.getAll.invalidate();
    },
  });

  const createMechanic = api.mechanic.create.useMutation({
    onError(error) {
      console.log(error);
      toast.error(error.message);
    },
    onSuccess() {
      toast.success("Mechanic has been created");
      handleCloseModal();
      void utils.mechanic.getAll.invalidate();
    },
  });

  const [formValues, setFormValues] = useState({
    id: selectedMechanic?.id,
    name: selectedMechanic?.name,
    maxActiveCars: selectedMechanic?.maxActiveCars,
  });

  const resetForm = () => {
    setFormValues({
      id: undefined,
      name: undefined,
      maxActiveCars: undefined,
    });
  };

  const handleOpenModal = () => {
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.currentTarget);
    setFormValues({
      ...formValues,
      [e.currentTarget.name]: e.currentTarget.value,
    });
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    // Submit the form data using the api
    setLoading(true);
    try {
      const validatedFormValues = mechanicFormSchema.parse({
        ...formValues,
        maxActiveCars: +(formValues.maxActiveCars ?? 0),
      });
      if (validatedFormValues.id != undefined) {
        updateMechanic.mutate({
          id: validatedFormValues.id,
          maxActiveCars: validatedFormValues.maxActiveCars,
          name: validatedFormValues.name,
        });
      } else {
        createMechanic.mutate(validatedFormValues);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0]?.message || "An error occurred.");
      } else {
        toast.error("An error occurred.");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    setFormValues({
      id: selectedMechanic?.id,
      name: selectedMechanic?.name,
      maxActiveCars: selectedMechanic?.maxActiveCars,
    });
  }, [
    selectedMechanic?.id,
    selectedMechanic?.name,
    selectedMechanic?.maxActiveCars,
  ]);

  return (
    <>
      <div className="flex h-full flex-col  justify-start">
        {mechanics.isLoading ? (
          <div className="flex h-full w-full flex-col items-center">
            <CircularProgress color="primary" size={50} />
          </div>
        ) : (
          <div>
            <Modal isOpen={modalIsOpen} onRequestClose={handleCloseModal}>
              <div className="flex flex-col items-start">
                <div className="flex w-full justify-end">
                  <button onClick={handleCloseModal}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <div className="w-70 p-4">
                  {selectedMechanic && (
                    <h2 className="mb-8 font-bold">Update mechanic</h2>
                  )}

                  {!selectedMechanic && (
                    <h2 className="mb-8 font-bold">Create mechanic</h2>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="text-gray-700">
                      Name
                      <input
                        name="name"
                        value={formValues.name}
                        onChange={handleInputChange}
                        type="text"
                        className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <label className="text-gray-700">
                      Max active cars
                      <input
                        name="maxActiveCars"
                        value={formValues.maxActiveCars}
                        onChange={handleInputChange}
                        type="number"
                        className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded bg-blue-500 px-4 py-2 text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress color="primary" size={24} />
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </Modal>
            <div className="mb-4 flex w-full justify-start">
              <button
                className="rounded bg-green-500 px-4 py-2 text-white"
                onClick={() => {
                  resetForm();
                  setSelectedMechanic(undefined);
                  handleOpenModal();
                }}
              >
                Create
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Mechanic Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Max Active Cars
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {mechanics.data?.map((mechanic) => (
                  <tr key={mechanic.name}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {mechanic.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {mechanic.maxActiveCars}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => {
                          setSelectedMechanic(mechanic);
                          handleOpenModal();
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Admin;
