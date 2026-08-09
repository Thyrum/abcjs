function toTimeAndStaffBased(abcLines) {
	const results = []
	for (let lin = 0; lin < abcLines.length; lin++) {
		const line = abcLines[lin]
		const staffGroup = line.staffGroup

		const group = []
		if (staffGroup && staffGroup && staffGroup.staffs) {
			for (let s = 0; s < staffGroup.staffs.length; s++) {
				const staff = staffGroup.staffs[s]
				const timeSlot = {}
				for (let i = 0; i < staff.voices.length; i++) {
					const voice = staffGroup.voices[staff.voices[i]]
					let time = 0
					for (let k = 0; k < voice.children.length; k++) {
						const index = 'T' + Math.round(time*1000) // There can be inexactness when calculating triplets, so we'll round, but we'll make sure that no make sure that we don't lose necessary precision by making it a shorter time than would ever happen
						if (!timeSlot[index])
							timeSlot[index] = []
						if (voice.children[k].abcelem.el_type === 'note') {
							timeSlot[index].push(voice.children[k])
							time += voice.children[k].duration
						}
					}
				}
				// Now timeSlot is an object with all the voices on a particular staff that
				// happen at the same time as an array.
				group.push(timeSlot)
			}
		}
		results.push(group)
	}
	return results
}

module.exports = toTimeAndStaffBased;
