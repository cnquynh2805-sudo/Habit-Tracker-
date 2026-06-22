import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Globe } from "lucide-react-native";

type LanguageSwitcherProps = {
  i18n: {
    language: string;
    changeLanguage: (lang: string) => Promise<void>;
  };
  colors: any; // bạn có thể thay bằng ThemeColors nếu đã có type
  onChange?: (lang: string) => void;
};

export default function LanguageSwitcher({
  i18n,
  colors,
  onChange,
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);

  const languages = [
    { id: "en", flag: "🇺🇸", code: "EN" },
    { id: "vi", flag: "🇻🇳", code: "VI" },
    { id: "fr", flag: "🇫🇷", code: "FR" },
    { id: "ja", flag: "🇯🇵", code: "JA" },
    { id: "zh", flag: "🇨🇳", code: "ZH" },
    { id: "de", flag: "🇩🇪", code: "DE" },
  ];

  const handleSelect = async (lang: string) => {
    await i18n.changeLanguage(lang);
    setOpen(false);
    onChange?.(lang);
  };

  return (
    <View style={{ position: "relative" }}>
      <TouchableOpacity onPress={() => setOpen(!open)}>
        <Globe color={colors.primary} size={24} />
      </TouchableOpacity>

      {open && (
        <View
          style={{
            position: "absolute",
            top: 32,
            right: 0,
            minWidth: 48 + 72,
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingVertical: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: 1,
            borderColor: colors.border,
            zIndex: 10000,
          }}
        >
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              onPress={() => handleSelect(lang.id)}
              style={{ paddingVertical: 10,
      paddingHorizontal: 14, }}
            >
              <Text
                style={{
                    color:
                    i18n.language === lang.id
                        ? colors.primary
                        : colors.textSecondary,

                    fontSize: 14,
                    fontWeight: i18n.language === lang.id ? "700" : "400",
                }}
                >
                {lang.flag} {lang.code}
                </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}