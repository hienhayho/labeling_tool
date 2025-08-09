"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Loader2, Search } from "lucide-react";
import { UserPublic } from "@/client";
import { useTranslations } from "next-intl";

interface AssignNewUserFormProps {
  availableUsers: UserPublic[];
  numTaskNotAssigned: number;
  isAssigning: boolean;
  onAssignTask: (userId: number, numSamples: number) => void;
}

export function AssignNewUserForm({
  availableUsers,
  numTaskNotAssigned,
  isAssigning,
  onAssignTask,
}: AssignNewUserFormProps) {
  const t = useTranslations();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [numSamples, setNumSamples] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users based on search query
  const filteredUsers = availableUsers.filter((user: UserPublic) => {
    const query = searchQuery.toLowerCase();
    const fullName = (user.full_name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const handleAssignTask = () => {
    if (selectedUserId && numSamples > 0) {
      onAssignTask(selectedUserId, numSamples);
      // Reset form
      setSelectedUserId(null);
      setNumSamples(1);
      setSearchQuery("");
    }
  };

  return (
    <div className="col-span-2 space-y-4 border-l pl-6">
      <h3 className="text-sm font-semibold">{t("project.assignNewUser")}</h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t("project.selectUser")}:
          </label>
          <Select
            value={selectedUserId?.toString() || ""}
            onValueChange={(value) => {
              setSelectedUserId(parseInt(value));
            }}
            disabled={availableUsers.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  availableUsers.length === 0
                    ? t("project.noAvailableUsers")
                    : t("project.selectUserPlaceholder")
                }
              />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("common.search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    {t("common.noResults")}
                  </div>
                ) : (
                  filteredUsers.map((user: UserPublic) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.full_name || user.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </div>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t("project.numSamples")}:
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={numSamples}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                const clampedValue = Math.max(
                  1,
                  Math.min(value, numTaskNotAssigned || 1),
                );
                setNumSamples(clampedValue);
              }}
              min={1}
              max={numTaskNotAssigned || 1}
              className="w-24"
              disabled={numTaskNotAssigned === 0}
            />
            <Slider
              value={[numSamples]}
              onValueChange={(value) => setNumSamples(value[0])}
              min={1}
              max={numTaskNotAssigned || 1}
              step={1}
              className="flex-1"
              disabled={numTaskNotAssigned === 0}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {t("project.maximum")}: {numTaskNotAssigned} {t("samples.samples")}
          </div>
        </div>

        <Button
          onClick={handleAssignTask}
          disabled={
            !selectedUserId ||
            numSamples <= 0 ||
            isAssigning ||
            numTaskNotAssigned === 0
          }
          className="w-full"
        >
          {isAssigning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("project.assigning")}
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              {t("project.assignTask")}
            </>
          )}
        </Button>

        {availableUsers.length === 0 && (
          <div className="text-sm text-muted-foreground text-center p-4 bg-gray-50 rounded-lg">
            {t("project.allUsersAssigned")}
          </div>
        )}
      </div>
    </div>
  );
}
