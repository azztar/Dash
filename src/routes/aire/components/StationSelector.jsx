import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export const StationSelector = ({ isOpen, onClose, stations, onSelect }) => {
    return (
        <Transition
            appear
            show={isOpen}
            as={Fragment}
        >
            <Dialog
                as="div"
                className="relative z-10"
                onClose={onClose}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title className="text-lg font-semibold">Selecciona una estación:</Dialog.Title>
                            <ul className="mt-4">
                                {stations.map((station) => (
                                    <li
                                        key={station.id_estacion}
                                        className="cursor-pointer rounded-md p-2 hover:bg-slate-100"
                                        onClick={() => onSelect(station)}
                                    >
                                        {station.nombre_estacion}
                                    </li>
                                ))}
                            </ul>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
