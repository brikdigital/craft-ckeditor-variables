<?php

namespace brikdigital\craftckeditorvariables\events;

use craft\base\Event;

class ReplaceEntryTypePlaceholder extends Event
{
    public string $entryTypeHandle;
    public string $fieldHandle;
    public string $replacement = '';

    public function getReplacement(): string
    {
        // Return possibly overriden value
        if ($this->replacement) {
            return $this->replacement;
        }

        // Default behavior
        $entry = $this->sender;

        if ($entry->type->handle !== $this->entryTypeHandle) {
            return '';
        }

        return $this->fieldHandle === 'title'
            ? $entry->title
            : $entry->getFieldValue($this->fieldHandle);
    }
}