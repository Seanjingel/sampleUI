import React from 'react';
import Button from "../components/common/Button";

const Setting = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-4">Settings Page</h2>
            <p className="text-gray-600">Your settings and preferences will appear here.</p>
            <Button className="mt-4 px-4 py-2 bg-gray-700 text-white hover:bg-blue-950" onClick={() => alert("Settings saved!")}>
                Save Settings
            </Button>
        </div>
    );
};

export default Setting;
