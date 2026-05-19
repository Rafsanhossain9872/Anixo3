import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';

const AVATAR_DATA = {
  "Bleach": [
    { name: "Ichigo Kurosaki", url: "" },
    { name: "Rukia Kuchiki", url: "" },
    { name: "Orihime Inoue", url: "" },
    { name: "Yasutora Chad", url: "" },
    { name: "Uryu Ishida", url: "" },
    { name: "Renji Abarai", url: "" },
    { name: "Byakuya Kuchiki", url: "" },
    { name: "Toshiro Hitsugaya", url: "" },
    { name: "Rangiku Matsumoto", url: "" },
    { name: "Kenpachi Zaraki", url: "" },
    { name: "Yoruichi Shihoin", url: "" },
    { name: "Kisuke Urahara", url: "" },
    { name: "Sosuke Aizen", url: "" },
    { name: "Gin Ichimaru", url: "" },
    { name: "Kaname Tosen", url: "" },
    { name: "Ulquiorra Cifer", url: "" },
    { name: "Grimmjow Jaegerjaquez", url: "" },
    { name: "Nelliel Tu", url: "" },
    { name: "Tier Harribel", url: "" },
    { name: "Starrk Coyote", url: "" },
    { name: "Barragan Louisenbairn", url: "" },
    { name: "Yamamoto Genryusai", url: "" },
    { name: "Soi Fon", url: "" },
    { name: "Retsu Unohana", url: "" },
    { name: "Isshin Kurosaki", url: "" },
  ],
  "Naruto": [
    { name: "Naruto Uzumaki", url: "" },
    { name: "Sasuke Uchiha", url: "" },
    { name: "Sakura Haruno", url: "" },
    { name: "Kakashi Hatake", url: "" },
    { name: "Hinata Hyuga", url: "" },
    { name: "Neji Hyuga", url: "" },
    { name: "Rock Lee", url: "" },
    { name: "Gaara", url: "" },
    { name: "Shikamaru Nara", url: "" },
    { name: "Ino Yamanaka", url: "" },
    { name: "Choji Akimichi", url: "" },
    { name: "Kiba Inuzuka", url: "" },
    { name: "Shino Aburame", url: "" },
    { name: "Tsunade", url: "" },
    { name: "Jiraiya", url: "" },
    { name: "Orochimaru", url: "" },
    { name: "Itachi Uchiha", url: "" },
    { name: "Kisame Hoshigaki", url: "" },
    { name: "Pain", url: "" },
    { name: "Konan", url: "" },
    { name: "Minato Namikaze", url: "" },
    { name: "Kushina Uzumaki", url: "" },
    { name: "Madara Uchiha", url: "" },
    { name: "Obito Uchiha", url: "" },
    { name: "Might Guy", url: "" },
  ],
  "OnePiece": [
    { name: "Monkey D. Luffy", url: "" },
    { name: "Roronoa Zoro", url: "" },
    { name: "Nami", url: "" },
    { name: "Usopp", url: "" },
    { name: "Vinsmoke Sanji", url: "" },
    { name: "Tony Tony Chopper", url: "" },
    { name: "Nico Robin", url: "" },
    { name: "Franky", url: "" },
    { name: "Brook", url: "" },
    { name: "Jinbe", url: "" },
    { name: "Shanks", url: "" },
    { name: "Dracule Mihawk", url: "" },
    { name: "Whitebeard", url: "" },
    { name: "Portgas D. Ace", url: "" },
    { name: "Sabo", url: "" },
    { name: "Trafalgar Law", url: "" },
    { name: "Boa Hancock", url: "" },
    { name: "Crocodile", url: "" },
    { name: "Donquixote Doflamingo", url: "" },
    { name: "Charlotte Katakuri", url: "" },
    { name: "Kaido", url: "" },
    { name: "Big Mom", url: "" },
    { name: "Gol D. Roger", url: "" },
    { name: "Coby", url: "" },
    { name: "Smoker", url: "" },
  ],
  "Boruto": [
    { name: "Boruto Uzumaki", url: "" },
    { name: "Sarada Uchiha", url: "" },
    { name: "Mitsuki", url: "" },
    { name: "Kawaki", url: "" },
    { name: "Himawari Uzumaki", url: "" },
    { name: "Shikadai Nara", url: "" },
    { name: "Inojin Yamanaka", url: "" },
    { name: "Chocho Akimichi", url: "" },
    { name: "Metal Lee", url: "" },
    { name: "Iwabe Yuino", url: "" },
    { name: "Sumire Kakei", url: "" },
    { name: "Namida Suzumeno", url: "" },
    { name: "Wasabi Izuno", url: "" },
    { name: "Denki Kaminarimon", url: "" },
    { name: "Kagura Karatachi", url: "" },
    { name: "Shinki", url: "" },
    { name: "Yodo", url: "" },
    { name: "Araya", url: "" },
    { name: "Delta", url: "" },
    { name: "Kashin Koji", url: "" },
    { name: "Code", url: "" },
    { name: "Ada", url: "" },
  ],
  "DemonSlayer": [
    { name: "Tanjiro Kamado", url: "" },
    { name: "Nezuko Kamado", url: "" },
    { name: "Zenitsu Agatsuma", url: "" },
    { name: "Inosuke Hashibira", url: "" },
    { name: "Kanao Tsuyuri", url: "" },
    { name: "Aoi Kanzaki", url: "" },
    { name: "Genya Shinazugawa", url: "" },
    { name: "Giyu Tomioka", url: "" },
    { name: "Shinobu Kocho", url: "" },
    { name: "Mitsuri Kanroji", url: "" },
    { name: "Obanai Iguro", url: "" },
    { name: "Muichiro Tokito", url: "" },
    { name: "Gyomei Himejima", url: "" },
    { name: "Sanemi Shinazugawa", url: "" },
    { name: "Rengoku Kyojuro", url: "" },
    { name: "Daki", url: "" },
    { name: "Gyutaro", url: "" },
    { name: "Akaza", url: "" },
    { name: "Doma", url: "" },
    { name: "Kokushibo", url: "" },
    { name: "Muzan Kibutsuji", url: "" },
  ],
  "ChainsawMan": [
    { name: "Denji", url: "" },
    { name: "Power", url: "" },
    { name: "Makima", url: "" },
    { name: "Aki Hayakawa", url: "" },
    { name: "Beam", url: "" },
    { name: "Kobeni Higashiyama", url: "" },
    { name: "Himeno", url: "" },
    { name: "Quanxi", url: "" },
    { name: "Violence Fiend", url: "" },
    { name: "Kishibe", url: "" },
    { name: "Reze", url: "" },
    { name: "Pochita", url: "" },
    { name: "Future Devil", url: "" },
    { name: "Eternity Devil", url: "" },
    { name: "Gun Devil", url: "" },
    { name: "Angel Devil", url: "" },
    { name: "Princi", url: "" },
    { name: "Yoru", url: "" },
    { name: "Asa Mitaka", url: "" },
    { name: "Yoshida", url: "" },
    { name: "Fumiko Mifune", url: "" },
  ],
  "JujutsuKaisen": [
    { name: "Yuji Itadori", url: "" },
    { name: "Satoru Gojo", url: "" },
    { name: "Megumi Fushiguro", url: "" },
    { name: "Nobara Kugisaki", url: "" },
    { name: "Kento Nanami", url: "" },
    { name: "Maki Zenin", url: "" },
    { name: "Panda", url: "" },
    { name: "Toge Inumaki", url: "" },
    { name: "Yuta Okkotsu", url: "" },
    { name: "Choso", url: "" },
    { name: "Mahito", url: "" },
    { name: "Jogo", url: "" },
    { name: "Hanami", url: "" },
    { name: "Dagon", url: "" },
    { name: "Suguru Geto", url: "" },
    { name: "Kenjaku", url: "" },
    { name: "Naoya Zenin", url: "" },
    { name: "Amai", url: "" },
    { name: "Kinji Hakari", url: "" },
    { name: "Yuki Tsukumo", url: "" },
    { name: "Ryomen Sukuna", url: "" },
    { name: "Hiromi Higuruma", url: "" },
  ],
  "DragonBall": [
    { name: "Son Goku", url: "" },
    { name: "Vegeta", url: "" },
    { name: "Gohan", url: "" },
    { name: "Piccolo", url: "" },
    { name: "Bulma", url: "" },
    { name: "Future Trunks", url: "" },
    { name: "Goten", url: "" },
    { name: "Krillin", url: "" },
    { name: "Android 18", url: "" },
    { name: "Android 17", url: "" },
    { name: "Cell", url: "" },
    { name: "Frieza", url: "" },
    { name: "Beerus", url: "" },
    { name: "Whis", url: "" },
    { name: "Broly", url: "" },
    { name: "Jiren", url: "" },
    { name: "Hit", url: "" },
    { name: "Caulifla", url: "" },
    { name: "Kale", url: "" },
    { name: "Pan", url: "" },
    { name: "Bardock", url: "" },
    { name: "Raditz", url: "" },
    { name: "Nappa", url: "" },
    { name: "Majin Buu", url: "" },
    { name: "Zamasu", url: "" },
  ],
  "FairyTail": [
    { name: "Natsu Dragneel", url: "" },
    { name: "Lucy Heartfilia", url: "" },
    { name: "Erza Scarlet", url: "" },
    { name: "Gray Fullbuster", url: "" },
    { name: "Wendy Marvell", url: "" },
    { name: "Happy", url: "" },
    { name: "Carla", url: "" },
    { name: "Gajeel Redfox", url: "" },
    { name: "Levy McGarden", url: "" },
    { name: "Mirajane Strauss", url: "" },
    { name: "Elfman Strauss", url: "" },
    { name: "Cana Alberona", url: "" },
    { name: "Laxus Dreyar", url: "" },
    { name: "Makarov Dreyar", url: "" },
    { name: "Mavis Vermillion", url: "" },
    { name: "Zeref Dragneel", url: "" },
    { name: "Acnologia", url: "" },
    { name: "Irene Belserion", url: "" },
    { name: "August", url: "" },
    { name: "Brandish", url: "" },
    { name: "Dimaria Yesta", url: "" },
    { name: "Rahkheid", url: "" },
    { name: "Jellal Fernandes", url: "" },
  ],
  "BleachChibi": [
    { name: "Chibi Ichigo", url: "" },
    { name: "Chibi Rukia", url: "" },
    { name: "Chibi Renji", url: "" },
    { name: "Chibi Byakuya", url: "" },
    { name: "Chibi Toshiro", url: "" },
    { name: "Chibi Rangiku", url: "" },
    { name: "Chibi Orihime", url: "" },
    { name: "Chibi Uryu", url: "" },
    { name: "Chibi Aizen", url: "" },
    { name: "Chibi Gin", url: "" },
    { name: "Chibi Yoruichi", url: "" },
    { name: "Chibi Urahara", url: "" },
    { name: "Chibi Kenpachi", url: "" },
    { name: "Chibi Grimmjow", url: "" },
    { name: "Chibi Ulquiorra", url: "" },
    { name: "Chibi Yamamato", url: "" },
    { name: "Chibi Nel", url: "" },
    { name: "Chibi Soi Fon", url: "" },
    { name: "Chibi Unohana", url: "" },
    { name: "Chibi Starrk", url: "" },
  ],
  "Inuyasha": [
    { name: "Inuyasha", url: "" },
    { name: "Kagome Higurashi", url: "" },
    { name: "Miroku", url: "" },
    { name: "Sango", url: "" },
    { name: "Shippo", url: "" },
    { name: "Kirara", url: "" },
    { name: "Sesshomaru", url: "" },
    { name: "Kikyo", url: "" },
    { name: "Naraku", url: "" },
    { name: "Koga", url: "" },
    { name: "Rin", url: "" },
    { name: "Jaken", url: "" },
    { name: "Kohaku", url: "" },
    { name: "Bankotsu", url: "" },
    { name: "Jakotsu", url: "" },
    { name: "Totosai", url: "" },
    { name: "Myoga", url: "" },
    { name: "Kaede", url: "" },
    { name: "Byakuya", url: "" },
    { name: "Kagura", url: "" },
  ],
  "OnePunchMan": [
    { name: "Saitama", url: "" },
    { name: "Genos", url: "" },
    { name: "Speed-o-Sound Sonic", url: "" },
    { name: "Bang", url: "" },
    { name: "Fubuki", url: "" },
    { name: "Tatsumaki", url: "" },
    { name: "King", url: "" },
    { name: "Drive Knight", url: "" },
    { name: "Flashy Flash", url: "" },
    { name: "Metal Bat", url: "" },
    { name: "Atomic Samurai", url: "" },
    { name: "Tank Top Master", url: "" },
    { name: "Garou", url: "" },
    { name: "Orochi", url: "" },
    { name: "Boros", url: "" },
    { name: "Elder Centipede", url: "" },
    { name: "Carnage Kabuto", url: "" },
    { name: "Black Spermatozoon", url: "" },
    { name: "Homeless Emperor", url: "" },
    { name: "Sweet Mask", url: "" },
  ],
  "Doraemon": [
    { name: "Doraemon", url: "" },
    { name: "Nobita Nobi", url: "" },
    { name: "Shizuka Minamoto", url: "" },
    { name: "Takeshi Goda", url: "" },
    { name: "Suneo Honekawa", url: "" },
    { name: "Dorami", url: "" },
    { name: "Sewashi Nobi", url: "" },
    { name: "Hidetoshi Dekisugi", url: "" },
    { name: "Nobisuke Nobi", url: "" },
    { name: "Tamako Nobi", url: "" },
  ],
  "SailorMoon": [
    { name: "Usagi Tsukino", url: "" },
    { name: "Ami Mizuno", url: "" },
    { name: "Rei Hino", url: "" },
    { name: "Makoto Kino", url: "" },
    { name: "Minako Aino", url: "" },
    { name: "Chibiusa", url: "" },
    { name: "Hotaru Tomoe", url: "" },
    { name: "Haruka Tenoh", url: "" },
    { name: "Michiru Kaioh", url: "" },
    { name: "Mamoru Chiba", url: "" },
    { name: "Luna", url: "" },
    { name: "Artemis", url: "" },
    { name: "Queen Serenity", url: "" },
    { name: "Queen Nehellenia", url: "" },
    { name: "Galaxia", url: "" },
  ],
  "Pokemon": [
    { name: "Ash Ketchum", url: "" },
    { name: "Pikachu", url: "" },
    { name: "Misty", url: "" },
    { name: "Brock", url: "" },
    { name: "Gary Oak", url: "" },
    { name: "Jessie", url: "" },
    { name: "James", url: "" },
    { name: "Meowth", url: "" },
    { name: "Cynthia", url: "" },
    { name: "Steven Stone", url: "" },
    { name: "Lance", url: "" },
    { name: "Red", url: "" },
    { name: "Goh", url: "" },
    { name: "Dawn", url: "" },
    { name: "Serena", url: "" },
    { name: "Clemont", url: "" },
    { name: "N", url: "" },
    { name: "Gladion", url: "" },
    { name: "Lillie", url: "" },
    { name: "Leon", url: "" },
  ],
  "TokyoGhoul": [
    { name: "Ken Kaneki", url: "" },
    { name: "Touka Kirishima", url: "" },
    { name: "Hinami Fueguchi", url: "" },
    { name: "Rize Kamishiro", url: "" },
    { name: "Shuu Tsukiyama", url: "" },
    { name: "Juuzou Suzuya", url: "" },
    { name: "Kishou Arima", url: "" },
    { name: "Uta", url: "" },
    { name: "Nishiki Nishio", url: "" },
    { name: "Yoshimura", url: "" },
    { name: "Eto Yoshimura", url: "" },
    { name: "Hide Nagachika", url: "" },
    { name: "Akira Mado", url: "" },
    { name: "Kuki Urie", url: "" },
    { name: "Kurona Yasuhisa", url: "" },
    { name: "Roma Hoito", url: "" },
    { name: "Tatara", url: "" },
    { name: "Noro", url: "" },
    { name: "Furuta Nimura", url: "" },
    { name: "Donato Porpora", url: "" },
  ],
  "Eyes": [
    { name: "Sharingan", url: "" },
    { name: "Rinnegan", url: "" },
    { name: "Byakugan", url: "" },
    { name: "Tenseigan", url: "" },
    { name: "Jougan", url: "" },
    { name: "Mangekyou", url: "" },
    { name: "Eternal MG", url: "" },
    { name: "Six Paths", url: "" },
    { name: "Rinne-Sharingan", url: "" },
    { name: "Isshiki Eye", url: "" },
    { name: "Limitless Eye", url: "" },
    { name: "Dragon Eye", url: "" },
  ],
};

const FALLBACK_SEEDS = [
  "Felix","Aneka","Aiden","Caleb","Callie","Tanjiro","Nezuko","Gojo","Luffy","Naruto",
  "Sasuke","Zenitsu","Inosuke","Denji","Power","Ichigo","Rukia","Vegeta","Natsu","Lucy",
];

function getAvatarUrl(char, index) {
  if (char.url) return char.url;
  const seed = FALLBACK_SEEDS[index % FALLBACK_SEEDS.length] || char.name.replace(/\s/g, "");
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export default function AvatarModal({ isOpen, onClose, onSave, currentAvatar }) {
  const [activeCategory, setActiveCategory] = useState(Object.keys(AVATAR_DATA)[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = Object.keys(AVATAR_DATA);
  const filteredAvatars = AVATAR_DATA[activeCategory];

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/1 backdrop-blur-sm transition-opacity duration-500 ease-out"
        onClick={onClose}
      />

      {/* Premium Modal Content */}
      <div className="relative w-[92%] md:w-full max-w-[500px] h-[80vh] md:h-[90vh] max-h-[850px] bg-[#1d1f24] border border-white/5 rounded-[24px] flex flex-col overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-7 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Avatar Collection
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar space-y-8">

          {/* Categories Section */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 border ${activeCategory === cat
                    ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-white/1 border-white/10 text-white hover:bg-white/30'
                    }`}
                >
                  #{cat}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Grid with locked max-height and scrollbar */}
          <div className="space-y-4">
            <div className="max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-red-600">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {filteredAvatars.map((char, index) => {
                  const avatarUrl = getAvatarUrl(char, index);
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedAvatar(avatarUrl)}
                      className="relative cursor-pointer group"
                      title={char.name}
                    >
                      <div className={`aspect-square rounded-full overflow-hidden border-2 transition-all duration-500 ${selectedAvatar === avatarUrl
                        ? 'border-red-600 ring-4 ring-red-600/20 scale-105'
                        : 'border-white/5 group-hover:border-white/20 group-hover:scale-105'
                        }`}>
                        <img
                          src={avatarUrl}
                          alt={char.name}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random`;
                          }}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {selectedAvatar === avatarUrl && (
                          <div className="absolute inset-0 bg-red-600/10 flex items-center justify-center animate-in fade-in duration-300">
                            <div className="bg-red-600 rounded-full p-0.5 shadow-lg">
                              <Check className="text-white" size={12} strokeWidth={5} />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-center text-[8px] text-white/30 truncate px-0.5 leading-tight">
                        {char.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-8 py-7 bg-white/[0.01] border-t border-white/5">
          <button
            onClick={() => onSave(selectedAvatar)}
            disabled={!selectedAvatar}
            className="mx-auto block px-10 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_8px_24px_rgba(220,38,38,0.2)] active:scale-[0.98]"
          >
            Save Changes
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(220, 38, 38, 0.4);
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thumb-red-600::-webkit-scrollbar-thumb {
          background: #dc2626;
          border-radius: 10px;
        }
      `}</style>
    </div>,
    document.body
  );
}
