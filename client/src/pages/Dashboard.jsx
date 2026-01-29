import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();

    // Fallback if no user (should not happen in ProtectedRoute)
    if ( !user ) return null;

    const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${ user.id }/${ user.avatar }.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

    return (
        <div className="min-h-screen bg-[#1a1b1e] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-[#2b2d31] rounded-2xl p-8 shadow-xl border border-[#1e1f22] flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <img
                            src={ avatarUrl }
                            alt={ `${ user.username }'s avatar` }
                            className="w-32 h-32 rounded-full border-4 border-[#5865F2] shadow-lg transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-[#2b2d31]"></div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold mb-2">{ user.global_name || user.username }</h1>
                        <p className="text-gray-400 text-lg mb-4">@{ user.username }</p>

                        <div className="bg-[#1e1f22] rounded-lg p-4 mb-6 inline-block md:block">
                            <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Email</p>
                            <p className="font-mono text-[#00b0f4]">{ user.email }</p>
                        </div>

                        <div className="flex gap-4 justify-center md:justify-start">
                            <button
                                onClick={ logout }
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;