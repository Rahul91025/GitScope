import React from "react";
import { MapPin, Calendar } from "lucide-react";

const ProfileCard = ({ profile }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="relative w-32 h-32 rounded-full border-2 border-gray-600 group-hover:border-cyan-400 transition-colors duration-300"
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {profile.name}
            </h1>
            <p className="text-xl text-gray-300">@{profile.login}</p>
          </div>

          {profile.bio && (
            <p className="text-gray-300 text-lg leading-relaxed">{profile.bio}</p>
          )}

          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400">
            {profile.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                {profile.location}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="flex justify-center md:justify-start gap-8 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{profile.public_repos}</div>
              <div className="text-gray-400 text-sm">Repositories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{profile.followers.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">{profile.following}</div>
              <div className="text-gray-400 text-sm">Following</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
