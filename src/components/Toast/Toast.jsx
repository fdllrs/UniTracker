import { useEffect, useState } from 'react';
import './Toast.css';

export default function Toast({ message }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 2500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className={`toast ${visible ? 'show' : ''}`}>
            {message}
        </div>
    );
}
