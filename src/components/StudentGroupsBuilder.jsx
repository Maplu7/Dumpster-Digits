import { useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc, deleteField } from "firebase/firestore";

function slugifyGroupName(name) {
  return (
    "group_" +
    String(name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40)
  );
}

export default function StudentGroupsBuilder({
  classroom,
  students,
  studentGroups,
  setManagerGroupId,
  setResetGroupId,
  setResultsGroupId,
}) {
  const [newGroupName, setNewGroupName] = useState("");
  const [groupBuilderStudentIds, setGroupBuilderStudentIds] = useState([]);
  const [dragOverBuilder, setDragOverBuilder] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  function handleDragStart(studentId) {
    return (event) => {
      event.dataTransfer.setData("text/plain", studentId);
      event.dataTransfer.effectAllowed = "move";
    };
  }

  function handleBuilderDrop(event) {
    event.preventDefault();
    setDragOverBuilder(false);

    const studentId = event.dataTransfer.getData("text/plain");
    if (!studentId) return;

    setGroupBuilderStudentIds((prev) =>
      prev.includes(studentId) ? prev : [...prev, studentId]
    );
  }

  function removeFromBuilder(studentId) {
    setGroupBuilderStudentIds((prev) => prev.filter((id) => id !== studentId));
  }

  async function saveGroup() {
    if (!classroom?.id) return;

    const name = newGroupName.trim();
    if (!name) {
      alert("Please enter a group name.");
      return;
    }

    if (!groupBuilderStudentIds.length) {
      alert("Drag at least one student into the group.");
      return;
    }

    const groupId = slugifyGroupName(name);
    if (!groupId) {
      alert("Please use a valid group name.");
      return;
    }

    const duplicate = studentGroups.find(
      (group) =>
        group.id === groupId ||
        String(group.name).toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      alert("A group with that name already exists.");
      return;
    }

    try {
      setIsSavingGroup(true);

      const classRef = doc(db, "classrooms", classroom.id);
      await updateDoc(classRef, {
        [`studentGroups.${groupId}`]: {
          name,
          studentIds: groupBuilderStudentIds,
        },
      });

      setNewGroupName("");
      setGroupBuilderStudentIds([]);
      setManagerGroupId(groupId);
      setResetGroupId(groupId);
      setResultsGroupId(groupId);
    } catch (error) {
      console.error("Error saving group:", error);
      alert("There was a problem saving the group.");
    } finally {
      setIsSavingGroup(false);
    }
  }

  async function deleteGroup(groupId) {
    if (!classroom?.id || !groupId) return;

    const confirmed = window.confirm("Delete this group?");
    if (!confirmed) return;

    try {
      const classRef = doc(db, "classrooms", classroom.id);
      await updateDoc(classRef, {
        [`studentGroups.${groupId}`]: deleteField(),
      });
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("There was a problem deleting the group.");
    }
  }

  return (
    <>
      <div className="tdash__group-builder">
        <div className="tdash__field">
          <label className="tdash__label">Group Name</label>
          <input
            className="tdash__input"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Ex: Blue Group"
          />
        </div>

        <div className="tdash__group-layout">
          <div className="tdash__group-column">
            <div className="tdash__mini-title">Drag Students</div>

            <div className="tdash__drag-students">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="tdash__drag-student"
                  draggable
                  onDragStart={handleDragStart(student.id)}
                >
                  {student.name || `Student ${student.id}`} ({student.id})
                </div>
              ))}
            </div>
          </div>

          <div className="tdash__group-column">
            <div className="tdash__mini-title">Drop Into Group</div>

            <div
              className={`tdash__drop-zone ${
                dragOverBuilder ? "tdash__drop-zone--active" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverBuilder(true);
              }}
              onDragLeave={() => setDragOverBuilder(false)}
              onDrop={handleBuilderDrop}
            >
              {groupBuilderStudentIds.length > 0 ? (
                <div className="tdash__drop-list">
                  {groupBuilderStudentIds.map((studentId) => {
                    const student = students.find((s) => s.id === studentId);
                    if (!student) return null;

                    return (
                      <div key={studentId} className="tdash__drop-chip">
                        <span>
                          {student.name || `Student ${student.id}`} ({student.id})
                        </span>
                        <button
                          type="button"
                          className="tdash__chip-remove"
                          onClick={() => removeFromBuilder(studentId)}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="tdash__drop-empty">
                  Drag students here to build a group
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="tdash__actions tdash__actions--left">
          <button
            className="tdash__manager-unlock"
            type="button"
            onClick={saveGroup}
            disabled={isSavingGroup}
          >
            {isSavingGroup ? "Saving..." : "Save Group"}
          </button>
        </div>
      </div>

      <div className="tdash__saved-groups">
        {studentGroups.length > 0 ? (
          studentGroups.map((group) => (
            <div key={group.id} className="tdash__saved-group">
              <div>
                <div className="tdash__saved-group-title">{group.name}</div>
                <div className="tdash__saved-group-subtitle">
                  {group.studentIds.length} student
                  {group.studentIds.length === 1 ? "" : "s"}
                </div>
              </div>

              <button
                className="tdash__danger-btn"
                type="button"
                onClick={() => deleteGroup(group.id)}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="tdash__empty-text">No groups made yet.</p>
        )}
      </div>
    </>
  );
}