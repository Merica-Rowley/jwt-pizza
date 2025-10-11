import React from "react";
import { useLocation } from "react-router-dom";
import { pizzaService } from "../service/service";
import View from "./view";
import Button from "../components/button";
import { useBreadcrumb } from "../hooks/appNavigation";

export default function RemoveUser() {
  const state = useLocation().state;
  const navigateToParentPath = useBreadcrumb();

  async function remove() {
    await pizzaService.removeUser(state.user);
    navigateToParentPath();
  }

  return (
    <View title="Are you sure?">
      <div className="text-start py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-neutral-100">
          Are you sure you want to delete{" "}
          <span className="text-orange-500">{state.user.name}'s</span> account?
          This will remove all their data and cannot be restored.
        </div>
        <Button title="Remove" onPress={remove} />
        <Button
          title="Cancel"
          onPress={navigateToParentPath}
          className="bg-transparent border-neutral-300"
        />
      </div>
    </View>
  );
}
