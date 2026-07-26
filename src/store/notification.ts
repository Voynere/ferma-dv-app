import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type NotificationState = {
    message: string;
    time: number;
    type: "success" | "error" | ""
    setMessage: (msg: string, type: "success" | "error" | "") => void;
};

const useNotificationStore = create<NotificationState>()(devtools((set, get) => ({
    message: "",
    time: 3,
    type: "",

    setMessage: (msg: string, type: "success" | "error" | "") => {
        set({ message: msg, type });

        setTimeout(() => {
            set({ time: 3, type: "", message: "" });
        }, get().time * 1000);
    },
})));

export default useNotificationStore;